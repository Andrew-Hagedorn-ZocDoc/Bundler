
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

});
