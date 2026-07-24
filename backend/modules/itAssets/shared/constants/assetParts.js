const RETURN_PARTS = Object.freeze([
  { partKey: "MONITOR", partName: "MONITOR" },
  { partKey: "LCD", partName: "LCD" },
  { partKey: "RAM", partName: "RAM" },
  { partKey: "SSD", partName: "SSD" },
  { partKey: "BATTERY", partName: "BATTERY" },
  { partKey: "KEYBOARD", partName: "KEYBOARD" },
  { partKey: "NETWORK_CARD", partName: "NETWORK CARD" },
  { partKey: "BULB", partName: "BULB" },
  { partKey: "HDMI", partName: "HDMI" },
]);

const ELIGIBLE_CATEGORY_KEYS = new Set([
  "LAPTOP",
  "DESKTOP",
  "DESKTOPADMINPC",
  "ADMINDESKTOP",
  "ADMINPC",
  "COMPUTERLABPC",
  "PROJECTOR",
]);

const PARTS_BY_KEY = new Map(
  RETURN_PARTS.map((part) => [part.partKey, part])
);

const normalizeIdentifier = (value) =>
  String(value || "")
    .trim()
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();

const normalizePartKey = (value) =>
  String(value || "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

const isNeedPartsCondition = (condition) => {
  const key = normalizeIdentifier(condition?.ConditionKey);
  const name = normalizeIdentifier(condition?.ConditionName);
  return key === "DAMAGED" || name === "NEEDPARTS";
};

const isEligibleComputerAsset = (asset) =>
  [asset?.CategoryKey, asset?.CategoryName]
    .map(normalizeIdentifier)
    .some((categoryKey) => ELIGIBLE_CATEGORY_KEYS.has(categoryKey));

const badRequest = (message) =>
  Object.assign(new Error(message), { statusCode: 400 });

const validateReturnParts = ({
  asset,
  returnCondition,
  requiredPartKeys,
}) => {
  const submittedKeys = requiredPartKeys ?? [];

  if (!Array.isArray(submittedKeys)) {
    throw badRequest("Required parts must be an array.");
  }

  const uniqueKeys = [
    ...new Set(submittedKeys.map(normalizePartKey).filter(Boolean)),
  ];
  const invalidKeys = uniqueKeys.filter((key) => !PARTS_BY_KEY.has(key));

  if (invalidKeys.length) {
    throw badRequest(`Invalid required part: ${invalidKeys.join(", ")}.`);
  }

  const needsParts = isNeedPartsCondition(returnCondition);
  const eligibleAsset = isEligibleComputerAsset(asset);

  if ((!needsParts || !eligibleAsset) && uniqueKeys.length) {
    throw badRequest(
      "Parts can only be selected for eligible computers returned with Need Parts."
    );
  }

  if (needsParts && eligibleAsset && uniqueKeys.length === 0) {
    throw badRequest("Select at least one required part.");
  }

  return uniqueKeys.map((key) => PARTS_BY_KEY.get(key));
};

module.exports = {
  RETURN_PARTS,
  isEligibleComputerAsset,
  isNeedPartsCondition,
  validateReturnParts,
};
