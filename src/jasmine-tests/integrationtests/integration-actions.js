
function Actions(
  testUtility,
  givens
)
{
    this.Utility = testUtility;
    this.Givens = givens;
};

exports.Actions = Actions;

Actions.prototype.Bundle = function() {
    this.Utility.CreateFile(this.Givens.TestDirectory, "test.css.bundle", this.Givens.BundleContents);
    this.Utility.Bundle(this.Givens.TestDirectory, this.Givens.BundleOptions + " -outputbundlestats:true -outputdirectory:./" + this.Givens.TestDirectory);
};