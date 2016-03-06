.pragma library
.import "../build/sphere.js" as Sphere

var SimpleDocument = Sphere.define('SimpleDocument', {
    text: Sphere.stringField(),
    num: Sphere.numberField(),
    bool: Sphere.booleanField(),
    date: Sphere.dateField(),
    testMethod: function() {
        return this.text
    }
})
