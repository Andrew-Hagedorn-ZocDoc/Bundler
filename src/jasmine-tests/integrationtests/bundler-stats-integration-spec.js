
describe("Integration Tests for Bundle Stats Collecting:", function() {

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
        testDirBase = 'stats-test-suite';

    beforeEach(function () {

        given.CleanTestSpace(testDirBase);
        given.OutputDirectoryIs('output-dir');
        given.FileToBundle('file1.js',    'var file1 = "file1";');
        given.FileToBundle('file2.js',    'var file2 = "file2";');
    });

    afterEach(function () {
        testUtility.CleanDirectory(testDirBase);
    });

    describe("Hashing: ", function() {

        it(" hashes not computed if the option is not specified.", function () {

            actions.Bundle();

            asserts.verifyFileDoesNotExist(given.OutputDirectory, 'bundle-hashes.json');
        });

        it("The stats option computes a hash for all bundles and puts it in the output directory.", function () {


            given.BundleOption('-outputbundlestats');

            actions.Bundle();

            asserts.verifyFileAndContentsAre(
                given.OutputDirectory,
                'bundle-hashes.json',
                '{\n' +
                '    "test.js": "1f293fa2bbd662c1c4ef9780550867a7"\n' +
                '}');
        });
    });


});
