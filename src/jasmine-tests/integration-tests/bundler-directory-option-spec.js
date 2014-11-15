
describe("Directory Option:", function() {

    var exec = require('child_process').exec,
		fs = require('fs'),
        testHelper = require('./helpers/integration-test-helper.js'),
        givensHelper = require('./helpers/integration-givens.js'),
        actionsHelper = require('./helpers/integration-actions.js'),
        assertsHelper = require('./helpers/integration-asserts.js'),
        testUtility = new testHelper.TestUtility(exec, fs, runs, waitsFor),
        given = new givensHelper.Givens(testUtility),
        actions, asserts,
        testDirBase = 'directory-option-test-suite';

	beforeEach(function () {
	    given.CleanTestSpace(testDirBase);
	    given.BundleOption("-directory");
    });

    afterEach(function () {
        testUtility.CleanDirectory(testDirBase);
    });

    describe("Js files", function () {

        beforeEach(function () {
            actions = new actionsHelper.Actions(testUtility, given, 'js');
            asserts = new assertsHelper.Asserts(testUtility, given, 'js');
        });

        it("The directory option allows entire subdirectories to be included", function () {
            
            given.SubDirectory('folder1');
            given.FileNotInBundleInSubDirectory('folder1', 'file1.js', 'var file1 = "file1";');
            given.FileNotInBundleInSubDirectory('folder1', 'file2.js', 'var file2 = "file2";');

            given.SubDirectory('folder2');
            given.FileNotInBundleInSubDirectory('folder2', 'file3.js', 'var file3 = "file3";');

            given.DirectoryToBundle('folder1');

            actions.Bundle();

            asserts.verifyBundleIs(';var file1="file1"\n'
                + ';var file2="file2"\n');
        });

        it("The directory option is recursive", function () {
            given.SubDirectory('folder1');
            given.SubDirectory('folder1/folder2');
            given.FileNotInBundleInSubDirectory('folder1', 'file1.js', 'var file1 = "file1";');
            given.FileNotInBundleInSubDirectory('folder1/folder2', 'file2.js', 'var file2 = "file2";');

            given.DirectoryToBundle('folder1');

            actions.Bundle();

            asserts.verifyBundleIs(';var file1="file1"\n'
                + ';var file2="file2"\n');
        });

        it("The directory option can be combined with direct file references", function () {
            given.SubDirectory('folder1');
            given.FileNotInBundleInSubDirectory('folder1', 'file1.js', 'var file1 = "file1";');
            given.FileNotInBundleInSubDirectory('folder1', 'file2.js', 'var file2 = "file2";');

            given.DirectoryToBundle('folder1');
            given.FileToBundle('file3.js', 'var file3 = "file3";');

            actions.Bundle();

            asserts.verifyBundleIs(';var file1="file1"\n'
                + ';var file2="file2"\n'
                + ';var file3="file3"\n');
        });

        it("Listing items before a directory preferentially orders them", function () {
            given.SubDirectory('folder1');
            given.FileNotInBundleInSubDirectory('folder1', 'file1.js', 'var file1 = "file1";');
            given.FileNotInBundleInSubDirectory('folder1', 'file2.js', 'var file2 = "file2";');
            given.FileNotInBundleInSubDirectory('folder1', 'file3.js', 'var file3 = "file3";');

            given.ExistingFileToBundle('folder1/file3.js');
            given.DirectoryToBundle('folder1');

            actions.Bundle();

            asserts.verifyBundleIs(';var file3="file3"\n'
                + ';var file1="file1"\n'
                + ';var file2="file2"\n');
        });
    });

    describe("Css Files", function () {

        beforeEach(function () {
            actions = new actionsHelper.Actions(testUtility, given, 'css');
            asserts = new assertsHelper.Asserts(testUtility, given, 'css');
        });

        it("The directory option allows entire subdirectories to be included", function () {
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

        it("Listing items before a directory preferentially orders them", function () {
            
            given.SubDirectory('folder1');
            given.FileNotInBundleInSubDirectory('folder1', 'file1.css', '.file1 { color: red; }');
            given.FileNotInBundleInSubDirectory('folder1', 'file2.css', '.file2 { color: green; }');
            given.FileNotInBundleInSubDirectory('folder1', 'file3.css', '.file3 { color: orange; }');

            given.ExistingFileToBundle('folder1/file3.css');
            given.DirectoryToBundle('folder1');

            actions.Bundle();

            asserts.verifyBundleIs('.file3{color:orange}\n'
                + '.file1{color:red}\n'
                + '.file2{color:green}\n');
        });
    });
});
