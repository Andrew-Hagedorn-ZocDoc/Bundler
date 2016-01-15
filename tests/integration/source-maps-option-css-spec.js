var testDirectory = 'source-maps-option-css-test-suite';
var integrationTest = require('./helpers/jasmine-wrapper.js');
var test = new integrationTest.Test(integrationTest.TestType.Css, testDirectory);

test.describeIntegrationTest("Generating CSS source maps:", function() {

    beforeEach(function () {
        test.resetTestType(integrationTest.TestType.Css);
    });

    it("Given source maps option and less file, then less is compiled with inline source maps.", function () {

        test.given.BundleOption('-sourcemaps');
        test.given.BundleOption('-siterootdirectory:' + test.given.BaseTestDirectory);

        test.given.FileToBundle('less1.less',
            '@color: red;\n.less1 { color: @color; }');

        test.actions.Bundle();

        test.assert.verifyFileAndContentsAre(test.given.TestDirectory, 'less1.css',
            ".less1 {\n  color: red;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi90ZXN0L2xlc3MxLmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7RUFBUyxVQUFBIn0= */");

    });

    it("Given source maps option and scss file, then lscssess is compiled with inline source maps.", function () {

        test.given.BundleOption('-sourcemaps');
        test.given.BundleOption('-siterootdirectory:' + test.given.BaseTestDirectory);

        test.given.FileToBundle('scss1.scss',
            '$green: #008000;\n#css-results { #scss { background: $green; } }');

        test.actions.Bundle();

        test.assert.verifyFileAndContentsAre(test.given.TestDirectory, 'scss1.css',
            "#css-results #scss {\n"
          + "  background: #008000; }\n\n"
          + "/*# sourceMappingURL=data:application/json;base64,ewoJInZlcnNpb24iOiAzLAoJInNvdXJjZVJvb3QiOiAiL3Rlc3QiLAoJImZpbGUiOiAic2NzczEuY3NzIiwKCSJzb3VyY2VzIjogWwoJCSJzY3NzMS5zY3NzIgoJXSwKCSJtYXBwaW5ncyI6ICJBQUNBLFlBQVksQ0FBRyxLQUFLLENBQUM7RUFBRSxVQUFVLEVBRHpCLE9BQU8sR0FDOEIiLAoJIm5hbWVzIjogW10KfQ== */");

    });
});
