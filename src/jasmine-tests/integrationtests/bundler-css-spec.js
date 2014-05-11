
describe("Css Bundling:", function() {

    var exec = require('child_process').exec,
		fs = require('fs'),
        testHelper = require('./integration-test-helper.js'),
        testUtility = new testHelper.TestUtility(exec, fs, runs, waitsFor),
        bundleContents,
        bundleOptions,
        testDirBase = 'css-test-suite',
		testDir = testDirBase + '/test';

	beforeEach(function () {

	    testUtility.CleanDirectory(testDirBase);
	    bundleOptions = "";
        bundleContents = "";
        testUtility.CreateDirectory(testDirBase);
        testUtility.CreateDirectory(testDir);
    });

    afterEach(function () {
        testUtility.CleanDirectory(testDirBase);
    });
	
    it("Given an invalid less file, bundling fails and an error is thrown.", function () {
        givenFileToBundle('less1.less', '@color: red;\n.less1 { color: @color; ');

        bundle();

        testUtility.VerifyErrorIs("missing closing `}`");
    });

	it("Given css files, they are concatenated into the output bundle.", function() {

	    givenFileToBundle('file1.css', '.file1 { color: red; }');
	    givenFileToBundle('file2.css', '.file2 { color: red; }');
	    givenFileNotInBundle('file3.css', '.file3 { color: red; }');

	    bundle();
	    
	    verifyBundleIs(".file1{color:red}\n"
                      + ".file2{color:red}\n");

	});  

	it("Given Less files, they are compiled and concatenated into the output bundle.", function () {

	    givenFileToBundle('less1.less', '@color: red;\n.less1 { color: @color; }');
	    givenFileNotInBundle('less2.less', '@color: red;\n.less2 { color: @color; }');
	    givenFileToBundle('less3.less', '@color: red;\n.less3 { color: @color; }');

	    bundle();

	    verifyBundleIs(".less1{color:red}\n"
                      + ".less3{color:red}\n");
	});

	it("Given Css and Less files together, it compiles and concatenates everything into the output bundle.", function () {
	    
	    givenFileToBundle('file1.css', '.file1 { color: red; }');
	    givenFileToBundle('file2.css', '.file2 { color: red; }');
	    givenFileToBundle('less1.less', '@color: red;\n.less1 { color: @color; }');
	    givenFileToBundle('less3.less', '@color: red;\n.less3 { color: @color; }');
	    givenFileNotInBundle('less2.less', '@color: red;\n.less2 { color: @color; }');
	    givenFileNotInBundle('file3.css', '.file3 { color: red; }');

	    bundle();

	    verifyBundleIs(".file1{color:red}\n"
                      + ".file2{color:red}\n"
                      + ".less1{color:red}\n"
                      + ".less3{color:red}\n");
	});

	it("Given rewrite image option, versions image urls with a hash of the image contents if the image exists on disk.", function () {

	    givenImages('an-image-there.jpg');

	    givenBundleOption("-rewriteimagefileroot:" + testDir + " -rewriteimageoutputroot:combined");


	    givenFileToBundle('file1.css', '.file1 { color: red; }\n'
                                     + '.aa { background: url("img/an-image-there.jpg") center no-repeat; }\n'
                                     + '.bb { background: url("img/an-image-not-there.jpg") center no-repeat; }\n');
	    givenFileToBundle('less1.less', '@color: red;\n'
                                     + '.a { background: url(\'an-image-there.jpg\') center no-repeat; }\n'
                                     + '.b { background: url("an-image-not-there.jpg") center no-repeat; }\n');

	    bundle();

	    verifyBundleIs(".file1{color:red}.aa{background:url('combined/version__d30407c38e441f3cb94732074bdfd05f__/img/an-image-there.jpg') center no-repeat}.bb{background:url('img/an-image-not-there.jpg') center no-repeat}\n"
                      + ".a{background:url('combined/version__d30407c38e441f3cb94732074bdfd05f__/an-image-there.jpg') center no-repeat}.b{background:url('an-image-not-there.jpg') center no-repeat}\n");
	});

	it("Given folder option, minifies all files in folder, but does not concatenate into a bundle."
    , function () {

        givenBundleOption("-folder");

        givenFileToBundle('file1.css', '.file1 { color: red; }');
        givenFileToBundle('file2.css', '.file2 { color: red; }');
        givenFileToBundle('file3.css', '.file3 { color: red; }');

        bundle();

        verifyFileAndContentsAre(testDir, 'file1.min.css', '.file1{color:red}');
        verifyFileAndContentsAre(testDir, 'file2.min.css', '.file2{color:red}');
        verifyFileAndContentsAre(testDir, 'file3.min.css', '.file3{color:red}');
        verifyFileDoesNotExist(testDir, 'test.min.css');
    });

	var verifyFileAndContentsAre = function (directory, file, expectedContents) {
	    testUtility.VerifyFileContents(directory, file, expectedContents);
	};

	var verifyFileDoesNotExist = function (directory, file) {
	    testUtility.VerifyFileDoesNotExist(directory, file);
	}

	var verifyBundleIs = function (expectedContents) {
	    verifyFileAndContentsAre(testDir, "test.min.css", expectedContents);
	};

	var bundle = function () {
	    testUtility.CreateFile(testDir, "test.css.bundle", bundleContents);
		testUtility.Bundle(testDir, bundleOptions + " -outputbundlestats:true -outputdirectory:./" + testDir);
	};

	var givenBundleOption = function (option) {
	    bundleOptions += " " + option;
	}

	var givenImages = function (imgFile) {
	    var imgDir = testDir + "/img";
	    testUtility.CreateDirectory(imgDir);

	    testUtility.CreateFile(imgDir, imgFile, 'image contents');
	    testUtility.CreateFile(testDir, imgFile, 'image contents');
	}

	var givenFileToBundle = function (fileName, contents) {
	    givenFileNotInBundle(fileName, contents);
		bundleContents = bundleContents + fileName + "\n";
	};

	var givenFileNotInBundle = function (fileName, contents) {
	    testUtility.CreateFile(testDir, fileName, contents);
	};
});
