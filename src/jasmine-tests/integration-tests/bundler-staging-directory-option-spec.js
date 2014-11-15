
describe("Outputting processed files into a staging folder:", function() {

    var exec = require('child_process').exec,
		fs = require('fs'),
        testHelper = require('./helpers/integration-test-helper.js'),
        givensHelper = require('./helpers/integration-givens.js'),
        actionsHelper = require('./helpers/integration-actions.js'),
        assertsHelper = require('./helpers/integration-asserts.js'),
        testUtility = new testHelper.TestUtility(exec, fs, runs, waitsFor),
        given = new givensHelper.Givens(testUtility),
        actions, asserts,
        testDirBase = 'staging-dir-option-test-suite';

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

            given.FileToBundle('file1.js', 'var file1 = "file1";');
            given.FileToBundle('file2.js', 'var file2 = "file2";');
            given.FileToBundle('file3.mustache', '<div>{{a}}</div>');

        });

        it("given option is not specified, does not output bundling artificats to a staging directory", function () {

            actions.Bundle();

            asserts.verifyFileExists(given.TestDirectory, 'file1.min.js');
            asserts.verifyFileExists(given.TestDirectory, 'file2.min.js');
            asserts.verifyFileExists(given.TestDirectory, 'file3.js');
            asserts.verifyFileExists(given.TestDirectory, 'file3.min.js');
            asserts.verifyFileExists(given.TestDirectory, 'test.js');
        });

        it("given option is specified, does not output bundling artificats to the test directory", function () {

            given.StagingDirectoryIs('staging-dir');

            actions.Bundle();

            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file1.min.js');
            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file2.min.js');
            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file3.js');
            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file3.min.js');
            asserts.verifyFileDoesNotExist(given.TestDirectory, 'test.js');
        });

        it("given option is specified, outputs bundling artificats to the staging directory", function () {

            given.StagingDirectoryIs('staging-dir');

            actions.Bundle();

            asserts.verifyFileExists(given.StagingDirectory, 'testjs/test-file1.min.js');
            asserts.verifyFileExists(given.StagingDirectory, 'testjs/test-file2.min.js');
            asserts.verifyFileExists(given.StagingDirectory, 'testjs/test-file3.js');
            asserts.verifyFileExists(given.StagingDirectory, 'testjs/test.js');
        });
      
    });

    describe("Css Files", function () {

        beforeEach(function () {
            actions = new actionsHelper.Actions(testUtility, given, 'css');
            asserts = new assertsHelper.Asserts(testUtility, given, 'css');

            given.FileToBundle('file1.css', '.file1 { color: red; }');
            given.FileToBundle('file2.css', '.file2 { color: green; }');
            given.FileToBundle('file3.less', '.file3 { color: orange; }');

        });

        it("given option is not specified, does not output bundling artificats to a staging directory", function () {

            actions.Bundle();

            asserts.verifyFileExists(given.TestDirectory, 'file1.min.css');
            asserts.verifyFileExists(given.TestDirectory, 'file2.min.css');
            asserts.verifyFileExists(given.TestDirectory, 'file3.css');
            asserts.verifyFileExists(given.TestDirectory, 'file3.min.css');
            asserts.verifyFileExists(given.TestDirectory, 'test.css');
        });

        it("given option is specified, does not output bundling artificats to the test directory", function () {

            given.StagingDirectoryIs('staging-dir');

            actions.Bundle();

            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file1.min.css');
            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file2.min.css');
            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file3.css');
            asserts.verifyFileDoesNotExist(given.TestDirectory, 'file3.min.css');
            asserts.verifyFileDoesNotExist(given.TestDirectory, 'test.css');
        });

        it("given option is specified, outputs bundling artificats to the staging directory", function () {

            given.StagingDirectoryIs('staging-dir');

            actions.Bundle();

            asserts.verifyFileExists(given.StagingDirectory, 'testcss/test-file1.min.css');
            asserts.verifyFileExists(given.StagingDirectory, 'testcss/test-file2.min.css');
            asserts.verifyFileExists(given.StagingDirectory, 'testcss/test-file3.css');
            asserts.verifyFileExists(given.StagingDirectory, 'testcss/test.css');
        });

    });
});
