// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Password Helper
// ============================================

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters.";

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

const meetsPasswordPolicy = (password) => {
  const value = String(password || "");
  return value.length >= 8;
};

const randomCharacter = (characters) =>
  characters[crypto.randomInt(0, characters.length)];

const generateTemporaryPassword = () => {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const allCharacters = `${uppercase}${lowercase}${numbers}`;
  const characters = [
    randomCharacter(uppercase),
    randomCharacter(lowercase),
    randomCharacter(numbers),
    ...Array.from({ length: 5 }, () => randomCharacter(allCharacters)),
  ];

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = crypto.randomInt(0, index + 1);
    [characters[index], characters[swapIndex]] = [
      characters[swapIndex],
      characters[index],
    ];
  }

  return characters.join("");
};

module.exports = {
  hashPassword,
  comparePassword,
  meetsPasswordPolicy,
  generateTemporaryPassword,
  PASSWORD_POLICY_MESSAGE,
};
