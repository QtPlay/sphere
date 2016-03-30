import QtQuick 2.0
import Sphere 0.1

ListModel {
    id: model

    property var where
    property string sortBy: 'id'

    /*!
      This is necessary so that the ListView sections correctly update.

      Set this property to the name of a property in your query object (it can
      include subproperties, seperated by `.`), and then in your ListView, set
      section.property to "section".
     */
    property string groupBy: ""

    property string className
    property var classObject: Sphere.getDocumentClass(className)

    property var query

    property var data: []
    property var objectIds: []

    onWhereChanged: updateQuery()
    onClassObjectChanged: {
        updateQuery()
        reload()
    }

    Component.onCompleted: {
        reload()

        Sphere.objectChanged.connect(function(className, object) {
            if (className !== model.className)
                return

            onObjectChanged(object)
        })

        Sphere.objectDeleted.connect(function(className, object) {
            if (className !== model.className)
                return

            if (objectIds.includes(object.id)) {
                removeId(object.id)
            }
        })
    }

    function update() {
        if (!classObject || !objectIds)
            return

        var objects = query.all()
        var newIds = listOfIds(objects)

        objects.forEach(function (object) {
            updateObject(object)
        })

        // Remove any documents that are currently in the query but not in the query
        var i = 0
        while (i < objectIds.length) {
            var docId = objectIds[i]

            if (!newIds.includes(docId)) {
                removeId(docId)
            } else {
                i++
            }
        }
    }

    function updateQuery() {
        if (!classObject)
            return

        var filter, args

        if (!where) {
            filter = ''
        } else if (Array.isArray(where)) {
            filter = where.length > 0 ? where[0] : ''
        } else {
            filter = where
        }

        if (Array.isArray(where)) {
            args = where.length > 0 ? where.slice(1) : []
        } else {
            args = []
        }

        query = classObject.where(filter, args)

        update()
    }

    function reload() {
        model.clear()

        if (!classObject)
            return

        data = query.all()

        sort()

        data.forEach(function(item) {
            model.append({
                "modelData": item,
                "section": item[groupBy]
            })
        })
    }

    function sort() {
        var list = sortBy.split(",")

        data = data.sort(function (b, a) {
            return Sphere.compare(a, b, sortBy)
        })

        objectIds = listOfIds(data)
    }

    function onObjectChanged(object) {
        var query

        if (model.query) {
            query = model.query.where({ id: object.id })
        } else {
            query = classObject.where({ id: object.id })
        }

        var matchingObject = query.get()

        if (matchingObject) {
            updateObject(object)
        } else if (!objectIds.includes(object.id)) {
            removeId(object.id)
        }
    }

    function updateObject(object) {
        if (!objectIds.includes(object.id)) {
            data.push(object)

            // Add it at the right location
            if (sortBy == "") {
                objectIds.push(object.id)
                model.append({'modelData': object, "section": object.valueForKey(groupBy)})
            } else {
                sort()

                var index = objectIds.indexOf(object.id)
                model.insert(index, {'modelData': object, "section": object.valueForKey(groupBy)})
            }
        } else {
            var currentIndex = objectIds.indexOf(object.id)

            model.data[currentIndex] = object
            sort()

            var newIndex = objectIds.indexOf(object.id)

            model.move(currentIndex, newIndex, 1)
            model.set(newIndex, {'modelData': object, "section": object.valueForKey(groupBy)})
        }
    }

    function listOfIds(objects) {
        return objects.map(function(object) { return object.id })
    }

    function at(index) {
        return data[index]
    }

    function removeId(id) {
        model.remove(objectIds.indexOf(id))
        objectIds.splice(objectIds.indexOf(id), 1)
        data.splice(data.indexOf(id), 1)
    }
}
