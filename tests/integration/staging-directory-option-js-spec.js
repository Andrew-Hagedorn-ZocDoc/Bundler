var testDirectory = 'staging-dir-option-test-js-suite';
var integrationTest = require('./helpers/jasmine-wrapper.js');
var test = new integrationTest.Test(integrationTest.TestType.Js, testDirectory);

test.describeIntegrationTest("Outputting processed js files into a staging folder:", function() {

    beforeEach(function () {
        test.given.FileToBundle('file1.js', 'var file1 = "file1";');
        test.given.FileToBundle('file2.js', 'var file2 = "file2";');
        test.given.FileToBundle('file3.mustache', '<div>{{a}}</div>');

    });

    it("given option is not specified, does not output bundling artificats to a staging directory", function () {

        test.actions.Bundle();

        test.assert.verifyFileExists(test.given.TestDirectory, 'file1.min.js');
        test.assert.verifyFileExists(test.given.TestDirectory, 'file2.min.js');
        test.assert.verifyFileExists(test.given.TestDirectory, 'file3.js');
        test.assert.verifyFileExists(test.given.TestDirectory, 'file3.min.js');
        test.assert.verifyFileExists(test.given.TestDirectory, 'test.js');
    });

    it("given option is specified, does not output bundling artificats to the test directory", function () {

        test.given.StagingDirectoryIs('staging-dir');

        test.actions.Bundle();

        test.assert.verifyFileDoesNotExist(test.given.TestDirectory, 'file1.min.js');
        test.assert.verifyFileDoesNotExist(test.given.TestDirectory, 'file2.min.js');
        test.assert.verifyFileDoesNotExist(test.given.TestDirectory, 'file3.js');
        test.assert.verifyFileDoesNotExist(test.given.TestDirectory, 'file3.min.js');
        test.assert.verifyFileDoesNotExist(test.given.TestDirectory, 'test.js');
    });

    it("given option is specified, outputs bundling artificats to the staging directory", function () {

        test.given.StagingDirectoryIs('staging-dir');

        test.actions.Bundle();

        test.assert.verifyFileExists(test.given.StagingDirectory, 'testjs/test-file1.min.js');
        test.assert.verifyFileExists(test.given.StagingDirectory, 'testjs/test-file2.min.js');
        test.assert.verifyFileExists(test.given.StagingDirectory, 'testjs/test-file3.js');
        test.assert.verifyFileExists(test.given.StagingDirectory, 'testjs/test.js');
    });
});
