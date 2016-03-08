import QtQuick 2.3
import QtTest 1.0
import Sphere 0.1
import "models.js" as Models

TestCase {
    name: "ES5Tests"

    function initTestCase() {
        Sphere.connect("sphere-tests", "Unit tests for sphere")
    }

    function test_connect() {
        // Open was called as part of the init methiod. All we do is verify it worked
        verify(Sphere.database != undefined, "The database should not be undefined")
    }

    function test_register() {
        // Register was called as part of the init methiod. All we do is verify it worked
        compare(Sphere.getDocumentClass('SimpleDocument'), Models.SimpleDocument,
                "The test class should have been registered")
    }

    function test_save() {
        var testObject = new Models.SimpleDocument()
        testObject.text = "ABC"
        testObject.date = new Date()
        testObject.num = 432.1
        testObject.bool = true

        testObject.save()
    }

    function test_method() {
        var testObject = new Models.SimpleDocument()
        testObject.text = "ABC"
        compare(testObject.testMethod(), testObject.text, 'Custom methods don\'t work')
    }
}
