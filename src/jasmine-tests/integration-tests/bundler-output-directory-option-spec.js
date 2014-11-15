
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
        testDirBase = 'output-dir-option-test-suite';

	beforeEach(function () {
	    given.CleanTestSpace(testDirBase);
	    given.OutputDirectoryIs('output-dir');
    });

    afterEach(function () {
        testUtility.CleanDirectory(testDirBase);
    });

    describe("Js files", function () {

        beforeEach(function () {
            actions = new actionsHelper.Actions(testUtility, given, 'js');
            asserts = new assertsHelper.Asserts(testUtility, given, 'js');
        });

        it("If an output directory is specified, then the minified bundle is put in it.", function () {
            
            given.FileToBundle('file1.js', 'var file1 = "file1";');
            given.FileToBundle('file2.js', 'var file2 = "file2";');

            actions.Bundle();

            asserts.verifyFileDoesNotExist(given.TestDirectory, 'test.min.css');
            asserts.verifyFileAndContentsAre(
                testDirBase + '/output-dir',
                'test.min.js',
                ';var file1="file1"\n'
                + ';var file2="file2"\n');
        });

        it("If an output directory is specified, then any minified files are put in it.", function () {
            given.FileToBundle('file1.js', 'var file1 = "file1";');
            given.FileToBundle('file2.mustache', '<div> {{c}} </div>');

            actions.Bundle();

            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file2.min.js');
            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file1.min.js');
            asserts.verifyFileAndContentsAre(
                testDirBase + '/output-dir',
                'file1.min.js',
                'var file1="file1"');
            asserts.verifyFileAndContentsAre(
                testDirBase + '/output-dir',
                'file2.min.js',
                'window.JST=window.JST||{},JST.file2=new Hogan.Template({code:function(a,b,c){var d=this;return d.b(c=c||""),d.b("<div> "),d.b(d.v(d.f("c",a,b,0))),d.b(" </div>"),d.fl()},partials:{},subs:{}})');
        });

        it("If an output directory is specified, then any computed files are put in it.", function () {
            given.FileToBundle('file1.js', 'var file1 = "file1";');
            given.FileToBundle('file2.mustache', '<div> {{c}} </div>');

            actions.Bundle();

            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file2.js');
            asserts.verifyFileAndContentsAre(
                testDirBase + '/output-dir',
                'file2.js',
                'window["JST"] = window["JST"] || {}; JST[\'file2\'] = new Hogan.Template({ code: function(c,p,i){var _=this;_.b(i=i||"");_.b("<div> ");_.b(_.v(_.f("c",c,p,0)));_.b(" </div>");return _.fl();;}, partials: {}, subs: {} });');
        });
    });

    describe("Css Files", function () {

        beforeEach(function () {
            actions = new actionsHelper.Actions(testUtility, given, 'css');
            asserts = new assertsHelper.Asserts(testUtility, given, 'css');
        });

        it("If an output directory is specified, then the minified bundle is put in it.", function () {
            given.FileToBundle('file1.css', '.file1 { color: red; }');
            given.FileToBundle('file2.css', '.file2 { color: green; }');

            actions.Bundle();

            asserts.verifyFileDoesNotExist(given.TestDirectory, 'test.min.css');
            asserts.verifyFileAndContentsAre(
                testDirBase + '/output-dir',
                'test.min.css',
                ".file1{color:red}\n"
                + ".file2{color:green}\n");
        });

        it("If an output directory is specified, then any minified files are put in it.", function () {
            given.FileToBundle('file1.css', '.file1 { color: red; }');
            given.FileToBundle('file2.less', '.file2 { color: green; }');

            actions.Bundle();

            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file2.min.css');
            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file1.min.css');
            asserts.verifyFileAndContentsAre(
                testDirBase + '/output-dir',
                'file1.min.css',
                ".file1{color:red}");
            asserts.verifyFileAndContentsAre(
                testDirBase + '/output-dir',
                'file2.min.css',
                ".file2{color:green}");
        });

        it("If an output directory is specified, then any computed files are put in it.", function () {
            given.FileToBundle('file1.css', '.file1 { color: red; }');
            given.FileToBundle('file2.less', '.file2 { color: green; }');

            actions.Bundle();

            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file2.css');
            asserts.verifyFileAndContentsAre(
                testDirBase + '/output-dir',
                'file2.css',
                ".file2 {\n" +
                "  color: green;\n" +
                "}\n");
        });
    });
});
