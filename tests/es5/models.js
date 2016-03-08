.pragma library
.import Sphere 0.1 as QML_Sphere

var Sphere = QML_Sphere.Sphere

var SimpleDocument = Sphere.define('SimpleDocument', {
    text: Sphere.stringField(),
    num: Sphere.numberField(),
    bool: Sphere.booleanField(),
    date: Sphere.dateField(),
    testMethod: function() {
        return this.text
    }
})
