
describe("Outputting to another directory:", function() {

    var exec = require('child_process').exec,
		fs = require('fs'),
        testHelper = require('./helpers/integration-test-helper.js'),
        givensHelper = require('./helpers/integration-givens.js'),
        actionsHelper = require('./helpers/integration-actions.js'),
        assertsHelper = require('./helpers/integration-asserts.js'),
        testUtility = new testHelper.TestUtility(exec, fs, runs, waitsFor),
        given = new givensHelper.Givens(testUtility),
        actions, asserts,
        testDirBase = 'folder-option-test-suite';

	beforeEach(function () {
	    given.CleanTestSpace(testDirBase);
    });

    afterEach(function () {
        testUtility.CleanDirectory(testDirBase);
    });

    describe("Js files", function () {

        beforeEach(function () {
            actions = new actionsHelper.Actions(testUtility, given, 'js');
            asserts = new assertsHelper.Asserts(testUtility, given, 'js');
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

    });

    describe("Css Files", function () {

        beforeEach(function () {
            actions = new actionsHelper.Actions(testUtility, given, 'css');
            asserts = new assertsHelper.Asserts(testUtility, given, 'css');
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
    });
});
