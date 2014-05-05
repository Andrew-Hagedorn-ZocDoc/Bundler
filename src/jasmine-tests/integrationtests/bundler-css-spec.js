
describe("Css Bundling:", function() {

    var exec = require('child_process').exec,
		fs = require('fs'),
        testHelper = require('./integration-test-helper.js'),
        testUtility = new testHelper.TestUtility(exec, fs, runs, waitsFor),
        bundleContents,
        testDirBase = 'css-test-suite',
		testDir = testDirBase + '/test';

	beforeEach(function () {

	    //testUtility.CleanDirectory(testDirBase);
        bundleContents = "";
        testUtility.CreateDirectory(testDirBase);
        testUtility.CreateDirectory(testDir);
    });

    afterEach(function () {
        testUtility.CleanDirectory(testDirBase);
    });
	
	it("Concatenates individual css files in a .bundle file into a single minified bundle.", function() {

	    givenFileToBundle('file1.css', '.file1 { color: red; }');
	    givenFileToBundle('file2.css', '.file2 { color: red; }');
	    givenFileNotInBundle('file3.css', '.file3 { color: red; }');

	    bundle();
	    
	    verifyBundleIs(".file1{color:red}\n"
                      + ".file2{color:red}\n");

	});  

	it("Compiles and Concatenates .less files", function () {

	    givenFileToBundle('less1.less', '@color: red;\n.less1 { color: @color; }');
	    givenFileNotInBundle('less2.less', '@color: red;\n.less2 { color: @color; }');
	    givenFileToBundle('less3.less', '@color: red;\n.less3 { color: @color; }');

	    bundle();

	    verifyBundleIs(".less1{color:red}\n"
                      + ".less3{color:red}\n");
	});

	var verifyBundleIs = function (expectedContents) {
		testUtility.VerifyFileContents(testDir, "test.min.css", expectedContents);
	};

	var bundle = function () {
		testUtility.CreateFile(testDir, "test.css.bundle", bundleContents);
		testUtility.Bundle(testDir, " -outputbundlestats:true -outputdirectory:./" + testDir);
	};

	var givenFileToBundle = function (fileName, contents) {
	    givenFileNotInBundle(fileName, contents);
		bundleContents = bundleContents + fileName + "\n";
	};

	var givenFileNotInBundle = function (fileName, contents) {
	    testUtility.CreateFile(testDir, fileName, contents);
	};
  
});
