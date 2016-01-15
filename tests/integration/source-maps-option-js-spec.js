var testDirectory = 'source-maps-option-js-test-suite';
var integrationTest = require('./helpers/jasmine-wrapper.js');
var test = new integrationTest.Test(integrationTest.TestType.Js, testDirectory);

test.describeIntegrationTest("Generating JS source maps:", function() {

    it("Given source maps option and JSX file, then JSX is compiled with inline source maps.", function () {

        test.given.BundleOption('-sourcemaps');
        test.given.BundleOption('-siterootdirectory:' + test.given.BaseTestDirectory);

        test.given.FileToBundle('file1.jsx',
            'var file1 = React.createClass({'
            + '   render: function() {'
            + '   return <div>file1 {this.props.name}</div>;'
            + '  }'
            + '});');

        test.actions.Bundle();

        test.assert.verifyFileAndContentsAre(
            test.given.TestDirectory,
            'file1.js',
            'var file1 = React.createClass({\n' +
            '  displayName: "file1",\n' +
            '  render: function () {\n' +
            '    return React.createElement(\n' +
            '      "div",\n' +
            '      null,\n' +
            '      "file1 ",\n' +
            '      this.props.name\n' +
            '    );\n' +
            '  } });\n' +
            '//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi90ZXN0L2ZpbGUxLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOztBQUFJLFFBQU0sRUFBRSxZQUFXO0FBQUksV0FBTzs7OztNQUFZLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSTtLQUFPLENBQUM7R0FBRyxFQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJ1bmtub3duIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGZpbGUxID0gUmVhY3QuY3JlYXRlQ2xhc3MoeyAgIHJlbmRlcjogZnVuY3Rpb24oKSB7ICAgcmV0dXJuIDxkaXY+ZmlsZTEge3RoaXMucHJvcHMubmFtZX08L2Rpdj47ICB9fSk7Il19'
        );

    });

    it("Given source maps option and ES6 file, then ES6 is compiled with inline source maps.", function () {

        test.given.BundleOption('-sourcemaps');
        test.given.BundleOption('-siterootdirectory:' + test.given.BaseTestDirectory);

        test.given.FileToBundle('file1.es6',
            'var odds = evens.map(v => v + 1);');

        test.actions.Bundle();

        test.assert.verifyFileAndContentsAre(test.given.TestDirectory, 'file1.js',
            '"use strict";\n\n'
          + 'var odds = evens.map(function (v) {\n'
          + '  return v + 1;\n'
          + '});\n'
          + '//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi90ZXN0L2ZpbGUxLmVzNiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO1NBQUksQ0FBQyxHQUFHLENBQUM7Q0FBQSxDQUFDLENBQUMiLCJmaWxlIjoidW5rbm93biIsInNvdXJjZXNDb250ZW50IjpbInZhciBvZGRzID0gZXZlbnMubWFwKHYgPT4gdiArIDEpOyJdfQ==');

    });
});
