import QtQuick 2.3
import QtTest 1.0
import Sphere 0.1
import "models.js" as Models

TestCase {
    name: "DatabaseTests"

    property string benchObjectId

    function initTestCase() {
        Sphere.connect("sphere-tests", "Unit tests for sphere", "1")

        var testObject = new Models.TestDocument()
        testObject.text = "ABC"
        testObject.date = new Date()
        testObject.num = 432.1
        testObject.bool = true

        testObject.save()

        benchObjectId = testObject.id
    }

    function init() {
        Models.TestDocument.deleteAll()
    }

    function test_connect() {
        // Open was called as part of the init methiod. All we do is verify it worked
        verify(Sphere.database() != undefined, "The database should not be undefined")
    }

    function test_register() {
        // Register was called as part of the init methiod. All we do is verify it worked
        compare(Sphere.getDocumentClass('TestDocument'), Models.TestDocument,
                "The test class should have been registered")
    }

    function test_load_data() {
        return [
            {text: "ABC", num: 4, date: new Date().toISOString(), bool: true}, // Basic valid date
            {text: "ABC", num: 4.2, date: new Date().toISOString(), bool: true}, // Decimal number
            {text: "ABC", num: 4.2, date: undefined, bool: true}, // No date
            {text: "ABC", num: 4.2, date: "test", bool: true}, // Invalid date
            {text: "ABC", num: 4.2, date: new Date().toISOString(), bool: false}, // Boolean "false"
            {text: null, num: 4, date: new Date().toISOString(), bool: true}, // Null data
            {}, // No data
        ]
    }

    function test_load(data) {
        var testObject = new Models.TestDocument(data)

        var date = data['date'] ? Sphere.isValidDate(data['date']) ? new Date(data['date']) : undefined
                                : undefined

        nullCompare(testObject.text, data['text'], "The text property should be set correctly")
        nullCompare(testObject.num, data['num'], "The number property should be set correctly")
        nullCompare(testObject.bool, data['bool'], "The boolean property should be set correctly")
        nullCompare(testObject.date, date, "The date property should be set correctly")
    }

    function test_save_data() {
        return [
            {text: "ABC", num: 4, date: new Date().toISOString(), bool: true}, // Basic valid date
            {text: "ABC", num: 4.2, date: new Date().toISOString(), bool: true}, // Decimal number
            {text: "ABC", num: 4.2, date: undefined, bool: true}, // No date
            {text: "ABC", num: 4.2, date: "test", bool: true}, // Invalid date
            {text: "ABC", num: 4.2, date: new Date().toISOString(), bool: false}, // Boolean "false"
            {text: null, num: 4, date: new Date().toISOString(), bool: true}, // Null data
            {}, // No data
        ]
    }

    function test_save(data) {
        var testObject = new Models.TestDocument(data)

        testObject.save()

        compare(testObject.id, 1)

        Sphere.readTransaction(function(tx) {
            var sql = 'SELECT * FROM TestDocument WHERE id = ?'

            var rows = tx.executeSql(sql, [testObject.id]).rows
            compare(rows.length, 1, "There should be only one instance of the test object")

            var match = rows.item(0)

            var dateString = Sphere.isValidDate(data['date']) ? data['date'] : ""

            nullCompare(match['text'], data['text'] ? data['text'] : "", "The text property should be set correctly")
            nullCompare(match['num'], data['num'] ? data['num'] : "", "The number property should be set correctly")
            nullCompare(match['bool'], data['bool'] === undefined ? "" : data['bool'] ? 1 : 0,
                    "The boolean property should be set correctly")
            nullCompare(match['date'], dateString,
                    "The date property should be set correctly")
        })
    }

    function test_get() {
        var testObject = new Models.TestDocument()
        testObject.text = "ABCDEFGHIJKLM"
        testObject.num = 123.5
        testObject.date = new Date("7/10/2015")
        testObject.bool = false

        testObject.save()

        var matchObject = Models.TestDocument.get(testObject.id)

        compare(matchObject.id, testObject.id)

        compare(matchObject.text, testObject.text,
                "The text property should match the original value")
        compare(matchObject.num, testObject.num,
                "The number property should match the original value")
        compare(matchObject.date, testObject.date,
                "The date property should match the original value")
        compare(matchObject.bool, testObject.bool,
                "The boolean property should match the original value")
    }

    function test_query() {
        var obj1 = new Models.TestDocument()
        obj1.text = "First object"
        var obj2 = new Models.TestDocument()
        obj2.text = "Second object"

        obj1.save()
        obj2.save()

        var matches = Models.TestDocument.where().all()

        compare(matches.length, 2, "There should be two matching objects")
        compare(matches[0].text, obj1.text, "The first object should be returned first")
        compare(matches[1].text, obj2.text, "The second object should be returned second")
    }

    function test_delete() {
        var testObject = new Models.TestDocument()
        testObject.text = "ABCDEFGHIJKLM"
        testObject.num = 123.5
        testObject.date = new Date("7/10/2015")
        testObject.bool = false

        testObject.save()

        var matchObject = Models.TestDocument.get(testObject.id)
        verify(matchObject, "The object should have saved")

        matchObject.delete()

        var matchObject = Models.TestDocument.get(testObject.id)

        verify(!matchObject, "The object should have been deleted and not returned")
    }

    function benchmark_save() {
        var testObject = new Models.TestDocument(data)
        testObject.text = "ABC"
        testObject.date = new Date()
        testObject.num = 432.1
        testObject.bool = true

        testObject.save()
    }

    function benchmark_get() {
        var matchObject = Models.TestDocument.get(benchObjectId)
    }

    function nullCompare(actual, expected, msg) {
        if (actual == null) actual = undefined
        if (expected == null) expected = undefined

        return compare(actual, expected, msg)
    }
}
