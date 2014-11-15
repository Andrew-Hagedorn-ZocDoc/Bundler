
describe("Css Bundling:", function() {

    var exec = require('child_process').exec,
		fs = require('fs'),
        testHelper = require('./helpers/integration-test-helper.js'),
        givensHelper = require('./helpers/integration-givens.js'),
        actionsHelper = require('./helpers/integration-actions.js'),
        assertsHelper = require('./helpers/integration-asserts.js'),
        testUtility = new testHelper.TestUtility(exec, fs, runs, waitsFor),
        given = new givensHelper.Givens(testUtility),
        actions = new actionsHelper.Actions(testUtility, given, 'css'),
        asserts = new assertsHelper.Asserts(testUtility, given, 'css'),
        testDirBase = 'css-test-suite';

	beforeEach(function () {
        given.CleanTestSpace(testDirBase);
    });

    afterEach(function () {
        testUtility.CleanDirectory(testDirBase);
    });
	
    it("Given an invalid less file, then bundling fails and an error is thrown.", function () {
        given.FileToBundle('less1.less', '@color: red;\n.less1 { color: @color; ');

        actions.Bundle();

        testUtility.VerifyErrorIs("missing closing `}`");
    });

	it("Given css files, then they are concatenated into the output bundle.", function() {

	    given.FileToBundle('file1.css', '.file1 { color: red; }');
	    given.FileToBundle('file2.css', '.file2 { color: red; }');
	    given.FileNotInBundle('file3.css', '.file3 { color: red; }');

	    actions.Bundle();
	    
	    asserts.verifyBundleIs(".file1{color:red}\n"
                      + ".file2{color:red}\n");

	});  

	it("Given Less files, then they are compiled and concatenated into the output bundle.", function () {

	    given.FileToBundle('less1.less', '@color: red;\n.less1 { color: @color; }');
	    given.FileNotInBundle('less2.less', '@color: red;\n.less2 { color: @color; }');
	    given.FileToBundle('less3.less', '@color: red;\n.less3 { color: @color; }');

	    actions.Bundle();

	    asserts.verifyBundleIs(".less1{color:red}\n"
                      + ".less3{color:red}\n");
	});

	it("Given Css and Less files together, then it compiles and concatenates everything into the output bundle.", function () {
	    
	    given.FileToBundle('file1.css', '.file1 { color: red; }');
	    given.FileToBundle('file2.css', '.file2 { color: red; }');
	    given.FileToBundle('less1.less', '@color: red;\n.less1 { color: @color; }');
	    given.FileToBundle('less3.less', '@color: red;\n.less3 { color: @color; }');
	    given.FileNotInBundle('less2.less', '@color: red;\n.less2 { color: @color; }');
	    given.FileNotInBundle('file3.css', '.file3 { color: red; }');

	    actions.Bundle();

	    asserts.verifyBundleIs(".file1{color:red}\n"
                      + ".file2{color:red}\n"
                      + ".less1{color:red}\n"
                      + ".less3{color:red}\n");
	});

	it("Given rewrite image option, then it versions image urls with a hash of the image contents if the image exists on disk.", function () {

	    givenImages('an-image-there.jpg');

	    given.BundleOption("-rewriteimagefileroot:" + given.TestDirectory + " -rewriteimageoutputroot:combined");


	    given.FileToBundle('file1.css', '.file1 { color: red; }\n'
                                     + '.aa { background: url("img/an-image-there.jpg") center no-repeat; }\n'
                                     + '.bb { background: url("img/an-image-not-there.jpg") center no-repeat; }\n');
	    given.FileToBundle('less1.less', '@color: red;\n'
                                     + '.a { background: url(\'an-image-there.jpg\') center no-repeat; }\n'
                                     + '.b { background: url("an-image-not-there.jpg") center no-repeat; }\n');

	    actions.Bundle();

	    asserts.verifyBundleIs(".file1{color:red}.aa{background:url('combined/version__d30407c38e441f3cb94732074bdfd05f__/img/an-image-there.jpg') center no-repeat}.bb{background:url('img/an-image-not-there.jpg') center no-repeat}\n"
                      + ".a{background:url('combined/version__d30407c38e441f3cb94732074bdfd05f__/an-image-there.jpg') center no-repeat}.b{background:url('an-image-not-there.jpg') center no-repeat}\n");
	});

	it("Given folder option, then it minifies all files in the top level folder, but does not concatenate into a bundle."
    , function () {

        given.BundleOption("-folder");

        given.FileNotInBundle('file1.css', '.file1 { color: red; }');
        given.FileNotInBundle('file2.css', '.file2 { color: red; }');
        given.FileNotInBundle('file3.css', '.file3 { color: red; }');

        actions.Bundle();

        asserts.verifyFileAndContentsAre(given.TestDirectory, 'file1.min.css', '.file1{color:red}');
        asserts.verifyFileAndContentsAre(given.TestDirectory, 'file2.min.css', '.file2{color:red}');
        asserts.verifyFileAndContentsAre(given.TestDirectory, 'file3.min.css', '.file3{color:red}');
        asserts.verifyFileDoesNotExist(given.TestDirectory, 'test.min.css');
    });

	it("Given folder and force bundle option, then it minifies all files in the top level folder and concatenates them into a bundle."
    , function () {

        given.BundleOption("-folder -forcebundle");

        given.FileNotInBundle('file1.css', '.file1 { color: red; }');
        given.FileNotInBundle('file2.css', '.file2 { color: red; }');
        given.FileNotInBundle('file3.css', '.file3 { color: red; }');

        actions.Bundle();

        asserts.verifyBundleIs('.file1{color:red}\n'
                     + '.file2{color:red}\n'
                     + '.file3{color:red}\n');
    });

	it("Given a sub directory, then by default the sub-directory is not included with the folder option.", function () {

	    var subDirectory = "sub_dir";
	    given.BundleOption("-folder -forcebundle");
	    given.SubDirectory(subDirectory);

	    given.FileNotInBundle('file1.css', '.file1 { color: red; }');
	    given.FileNotInBundleInSubDirectory(subDirectory, 'file2.css', '.file2 { color: red; }');
	    given.FileNotInBundleInSubDirectory(subDirectory, 'less1.less', '@color: red;\n.less1 { color: @color; }');

	    actions.Bundle();

	    asserts.verifyBundleIs('.file1{color:red}\n');
	});

	it("Given the recursive option, then files in sub-directories are included in the bundle.", function () {
	    
	    var subDirectory = "sub_dir";
	    given.BundleOption("-folder:recursive -forcebundle");
	    given.SubDirectory(subDirectory);

	    given.FileNotInBundle('file1.css', '.file1 { color: red; }');
	    given.FileNotInBundleInSubDirectory(subDirectory, 'file2.css', '.file2 { color: red; }');
	    given.FileNotInBundleInSubDirectory(subDirectory, 'less1.less', '@color: red;\n.less1 { color: @color; }');

	    actions.Bundle();

	    asserts.verifyBundleIs('.file1{color:red}\n'
                     + '.file2{color:red}\n'
                     + '.less1{color:red}\n');

	});

    it("The directory option allows entire subdirectories to be included", function () {
        given.BundleOption("-directory");

        given.SubDirectory('folder1');
        given.FileNotInBundleInSubDirectory('folder1', 'file1.css', '.file1 { color: red; }');
        given.FileNotInBundleInSubDirectory('folder1', 'file2.less', '.less1 { color: green; }');

        given.SubDirectory('folder2');
        given.FileNotInBundleInSubDirectory('folder2', 'file3.css', '.file2 { color: blue; }');

        given.DirectoryToBundle('folder1');

        actions.Bundle();

        asserts.verifyBundleIs('.file1{color:red}\n'
                     + '.less1{color:green}\n');
    });

    it("The directory option is recursive", function () {
        given.BundleOption("-directory");

        given.SubDirectory('folder1');
        given.SubDirectory('folder1/folder2');
        given.FileNotInBundleInSubDirectory('folder1', 'file1.css', '.file1 { color: red; }');
        given.FileNotInBundleInSubDirectory('folder1/folder2', 'file2.less', '.less1 { color: green; }');

        given.DirectoryToBundle('folder1');

        actions.Bundle();

        asserts.verifyBundleIs('.file1{color:red}\n'
            + '.less1{color:green}\n');
    });

    it("The directory option can be combined with direct file references", function () {
        given.BundleOption("-directory");

        given.SubDirectory('folder1');
        given.FileNotInBundleInSubDirectory('folder1', 'file1.css', '.file1 { color: red; }');
        given.FileNotInBundleInSubDirectory('folder1', 'file2.less', '.less1 { color: green; }');

        given.DirectoryToBundle('folder1');
        given.FileToBundle('file3.css', '.file3 { color: orange; }\n');

        actions.Bundle();

        asserts.verifyBundleIs('.file1{color:red}\n'
            + '.less1{color:green}\n'
            + '.file3{color:orange}\n');
    });

	var givenImages = function (imgFile) {
	    var imgDir = given.TestDirectory + "/img";
	    testUtility.CreateDirectory(imgDir);

	    testUtility.CreateFile(imgDir, imgFile, 'image contents');
	    testUtility.CreateFile(given.TestDirectory, imgFile, 'image contents');
	};

});
