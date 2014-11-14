
describe("Js Bundling:", function() {

    var exec = require('child_process').exec,
		fs = require('fs'),
        testHelper = require('./helpers/integration-test-helper.js'),
        givensHelper = require('./helpers/integration-givens.js'),
        actionsHelper = require('./helpers/integration-actions.js'),
        assertsHelper = require('./helpers/integration-asserts.js'),
        testUtility = new testHelper.TestUtility(exec, fs, runs, waitsFor),
        given = new givensHelper.Givens(testUtility),
        actions = new actionsHelper.Actions(testUtility, given, 'js'),
        asserts = new assertsHelper.Asserts(testUtility, given, 'js'),
        testDirBase = 'js-test-suite';

	beforeEach(function () {
        given.CleanTestSpace(testDirBase);
    });

    afterEach(function () {
        testUtility.CleanDirectory(testDirBase);
    });

    it("Given js files, then they are concatenated into the output bundle.", function() {

        given.FileToBundle('file1.js',    'var file1 = "file1";');
        given.FileToBundle('file2.js',    'var file2 = "file2";');
        given.FileNotInBundle('file3.js', 'var file3 = "file3";');

        actions.Bundle();

        asserts.verifyBundleIs(';var file1="file1"\n'
            + ';var file2="file2"\n');
    });

    it("Given mustache files, then they are concatenated into the output bundle.", function() {

        given.FileToBundle('file1.mustache',    '<div> {{a}} </div>');
        given.FileToBundle('file2.mustache',    '<div> {{b}} </div>');
        given.FileNotInBundle('file3.mustache', '<div> {{c}} </div>');

        actions.Bundle();

        asserts.verifyBundleIs(';window.JST=window.JST||{},JST.file1=new Hogan.Template({code:function(a,b,c){var d=this;return d.b(c=c||""),d.b("<div> "),d.b(d.v(d.f("a",a,b,0))),d.b(" </div>"),d.fl()},partials:{},subs:{}})\n'
            + ';window.JST=window.JST||{},JST.file2=new Hogan.Template({code:function(a,b,c){var d=this;return d.b(c=c||""),d.b("<div> "),d.b(d.v(d.f("b",a,b,0))),d.b(" </div>"),d.fl()},partials:{},subs:{}})\n');
    });

    it("Given invalid mustache, an error is thrown.", function() {

        given.FileToBundle('file1.mustache',    '<div> {{#i}} </div>');

        actions.Bundle();

        asserts.verifyErrorOnBundle('"Error: missing closing tag: i')
    });

    it("Given js and mustache files, then they are concatenated into the output bundle.", function() {

        given.FileToBundle('file1.mustache',    '<div> {{a}} </div>');
        given.FileToBundle('file2.js',    'var file2 = "file2";');
        given.FileNotInBundle('file3.mustache', '<div> {{c}} </div>');

        actions.Bundle();

        asserts.verifyBundleIs(';window.JST=window.JST||{},JST.file1=new Hogan.Template({code:function(a,b,c){var d=this;return d.b(c=c||""),d.b("<div> "),d.b(d.v(d.f("a",a,b,0))),d.b(" </div>"),d.fl()},partials:{},subs:{}})\n'
            + ';var file2="file2"\n');
    });

    it("Given folder option, then it minifies all files in the top level folder, but does not concatenate into a bundle."
        , function () {

            given.BundleOption("-folder");

            given.FileNotInBundle('file1.js', 'var file1 = "file1";');
            given.FileNotInBundle('file2.js', 'var file2 = "file2";');
            given.FileNotInBundle('file3.js', 'var file3 = "file3";');

            actions.Bundle();

            asserts.verifyFileAndContentsAre(given.TestDirectory, 'file1.min.js', 'var file1="file1"');
            asserts.verifyFileAndContentsAre(given.TestDirectory, 'file2.min.js', 'var file2="file2"');
            asserts.verifyFileAndContentsAre(given.TestDirectory, 'file3.min.js', 'var file3="file3"');
            asserts.verifyFileDoesNotExist(given.TestDirectory, 'test.min.js');
    });

    it("Given folder and force bundle option, then it minifies all files in the top level folder and concatenates them into a bundle."
        , function () {

            given.BundleOption("-folder -forcebundle");

            given.FileNotInBundle('file1.js', 'var file1 = "file1";');
            given.FileNotInBundle('file2.js', 'var file2 = "file2";');
            given.FileNotInBundle('file3.js', 'var file3 = "file3";');

            actions.Bundle();

            asserts.verifyBundleIs(';var file1="file1"\n'
                + ';var file2="file2"\n'
                + ';var file3="file3"\n');
    });

    it("Given the recursive option, then files in sub-directories are included in the bundle.", function () {

        var subDirectory = "sub_dir";
        given.BundleOption("-folder:recursive -forcebundle");
        given.SubDirectory(subDirectory);

        given.FileNotInBundle('file1.js', 'var file1 = "file1";');
        given.FileNotInBundleInSubDirectory(subDirectory, 'file2.js', 'var file2 = "file2";');
        given.FileNotInBundleInSubDirectory(subDirectory, 'file3.mustache', '<div> {{c}} </div>');

        actions.Bundle();

        asserts.verifyBundleIs(';var file1="file1"\n'
            + ';var file2="file2"\n'
            + ';window.JST=window.JST||{},JST.file3=new Hogan.Template({code:function(a,b,c){var d=this;return d.b(c=c||""),d.b("<div> "),d.b(d.v(d.f("c",a,b,0))),d.b(" </div>"),d.fl()},partials:{},subs:{}})\n');

    });

    it("The directory option allows entire subdirectories to be included", function () {
        given.BundleOption("-directory");

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
        given.BundleOption("-directory");

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
        given.BundleOption("-directory");

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
});
