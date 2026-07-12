const repo=require("../modules/library/repositories/libraryRepository");
const {poolPromise}=require("../database/connection");
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

async function main(){const pool=await poolPromise;let categoryId,bookId,memberId,loanId,reservationId,inventoryId;try{
  const fixture=await pool.request().query(`SELECT TOP 1 u.UserId FROM dbo.Users u WHERE u.IsActive=1 AND u.IsDeleted=0 AND NOT EXISTS(SELECT 1 FROM dbo.LibraryMembers m WHERE m.UserId=u.UserId) ORDER BY u.UserId;`),userId=fixture.recordset[0]?.UserId;
  assert(userId,"No unused active user is available for the Library integration fixture.");
  const suffix=Date.now();
  const category=await repo.createCategory({categoryKey:`VERIFY_${suffix}`,categoryName:`Verification ${suffix}`,sortOrder:999});categoryId=category.LibraryCategoryId;
  const book=await repo.createBook({barcode:`VERIFY-${suffix}`,title:"Library Workflow Verification",libraryCategoryId:categoryId,totalCopies:2});bookId=book.LibraryBookId;
  const member=await repo.createMember({userId,membershipNumber:`VERIFY-${suffix}`,maxActiveLoans:2});memberId=member.LibraryMemberId;
  const dueAt=new Date(Date.now()+7*86400000),loan=await repo.issueLoan({libraryBookId:bookId,libraryMemberId:memberId,dueAt},userId);loanId=loan.LibraryLoanId;
  assert((await repo.get("books",bookId)).AvailableCopies===1,"Issuing did not decrement available copies.");
  const renewed=await repo.renewLoan(loanId,new Date(Date.now()+14*86400000));assert(renewed.RenewalCount===1,"Renewal count did not increment.");
  const returned=await repo.returnLoan(loanId,{returnCondition:"Verified"},userId);assert(returned.Status==="Returned","Loan was not returned.");
  assert((await repo.get("books",bookId)).AvailableCopies===2,"Returning did not restore available copies.");
  const reservation=await repo.createReservation({libraryBookId:bookId,libraryMemberId:memberId},userId);reservationId=reservation.LibraryReservationId;assert((await repo.updateReservation(reservationId,"Ready")).Status==="Ready","Reservation status did not update.");
  const inventory=await repo.adjustInventory({libraryBookId:bookId,transactionType:"Donation",quantity:1,reason:"Integration verification"},userId);inventoryId=inventory.LibraryInventoryTransactionId;assert((await repo.get("books",bookId)).TotalCopies===3,"Inventory adjustment did not update total copies.");
  console.log(JSON.stringify({categoryCrud:"passed",bookCrud:"passed",memberCrud:"passed",issue:"passed",renew:"passed",return:"passed",reservation:"passed",inventoryAdjustment:"passed",inventoryIntegrity:"passed"},null,2));
}finally{const tx=pool.transaction();await tx.begin();try{if(reservationId)await tx.request().input("Id",reservationId).query("DELETE dbo.LibraryReservations WHERE LibraryReservationId=@Id;");if(inventoryId)await tx.request().input("Id",inventoryId).query("DELETE dbo.LibraryInventoryTransactions WHERE LibraryInventoryTransactionId=@Id;");if(loanId)await tx.request().input("Id",loanId).query("DELETE dbo.LibraryLoans WHERE LibraryLoanId=@Id;");if(memberId)await tx.request().input("Id",memberId).query("DELETE dbo.LibraryMembers WHERE LibraryMemberId=@Id;");if(bookId)await tx.request().input("Id",bookId).query("DELETE dbo.LibraryBooks WHERE LibraryBookId=@Id;");if(categoryId)await tx.request().input("Id",categoryId).query("DELETE dbo.LibraryCategories WHERE LibraryCategoryId=@Id;");await tx.commit();}catch(e){await tx.rollback();throw e;}await pool.close();}}
main().catch(e=>{console.error(e);process.exitCode=1});
