
function Asserts(
  testUtility,
  givens
)
{
    this.Utility = testUtility;
    this.Givens = givens;
};

exports.Asserts = Asserts;

Asserts.prototype.verifyBundleIs = function(expectedContents) {
    this.Utility.VerifyFileContents(this.Givens.TestDirectory, "test.min.css", expectedContents);
};

Asserts.prototype.verifyFileAndContentsAre = function (directory, file, expectedContents) {
    this.Utility.VerifyFileContents(directory, file, expectedContents);
};

Asserts.prototype.verifyFileDoesNotExist = function (directory, file) {
    this.Utility.VerifyFileDoesNotExist(directory, file);
};