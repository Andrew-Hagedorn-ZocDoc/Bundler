
function Givens(
  testUtility
)
{
    this.Utility = testUtility;
    this.BundleOptions = "";
    this.BundleContents = "";
    this.TestDirectory = "";
    this.BaseTestDirectory = "";
};

exports.Givens = Givens;

Givens.prototype.CleanTestSpace = function(testDirBase) {

    this.BaseTestDirectory = testDirBase;
    this.TestDirectory = testDirBase + '/test'
    this.Utility.CleanDirectory(this.BaseTestDirectory);
    this.Utility.CreateDirectory(this.BaseTestDirectory);
    this.Utility.CreateDirectory(this.TestDirectory);
    this.BundleOptions = "";
    this.BundleContents = "";
    this.OutputDirectory = "./" + this.TestDirectory;
};

Givens.prototype.FileNotInBundle = function (fileName, contents) {
    this.Utility.CreateFile(this.TestDirectory, fileName, contents);
};

Givens.prototype.FileNotInBundleInSubDirectory = function (subDirectory, file, contents) {
    var fullDir = this.TestDirectory + "/" + subDirectory;
    this.Utility.CreateFile(fullDir, file, contents);
};

Givens.prototype.FileToBundle = function (fileName, contents) {
    this.FileNotInBundle(fileName, contents);
    this.BundleContents = this.BundleContents + fileName + "\n";
};

Givens.prototype.DirectoryToBundle = function(directoryName) {
    this.BundleContents = this.BundleContents + directoryName + "\n";
};

Givens.prototype.SubDirectory = function (directory) {
    var subDir = this.TestDirectory + "/" + directory;
    this.Utility.CreateDirectory(subDir);
};

Givens.prototype.BundleOption = function (option) {
    this.BundleOptions += " " + option;
};

Givens.prototype.OutputDirectoryIs = function (directory) {
    var rootedDir = this.BaseTestDirectory + '/' + directory;
    this.Utility.CreateDirectory(rootedDir);
    this.OutputDirectory = "./" + rootedDir;
};