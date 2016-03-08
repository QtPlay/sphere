import QtQuick 2.0
import Sphere 0.1

ListModel {
    id: query

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

    property string filter
    property var args: []

    property var data: []
    property var objectIds: []

    onWhereChanged: {
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

        update()
    }

    onClassObjectChanged: reload()

    Component.onCompleted: {
        reload()

        Sphere.objectChanged.connect(function(className, object) {
            if (className !== query.className)
                return

            onObjectChanged(object)
        })

        Sphere.objectDeleted.connect(function(className, object) {
            if (className !== query.className)
                return

            if (objectIds.indexOf(object.id) != -1) {
                removeId(object.id)
            }
        })
    }

    function update() {
        if (!classObject)
            return

        var objects = classObject.find(query.filter, query.args)
        var newIds = listOfIds(objects)

        objects.forEach(function (object) {
            updateObject(object)
        })

        // Remove any documents that are currently in the query but not in the query
        var i = 0
        while (i < objectIds.length) {
            var docId = objectIds[i]

            if (newIds.indexOf(docId) == -1) {
                removeId(docId)
            } else {
                i++
            }
        }
    }

    function reload() {
        query.clear()

        if (!classObject)
            return

        data = classObject.find(query.filter, query.args)

        sort()

        data.forEach(function(item) {
            query.append({
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
        var filter = 'id = ?'

        if (query.query)
            filter += ' AND ' + query.filter

        var args = [object.id]
        args.concat(query.args)

        var matchingObject = classObject.findOne(filter, args)

        if (matchingObject) {
            updateObject(object)
        } else if (objectIds.indexOf(object.id) != -1) {
            removeId(object.id)
        }
    }

    function updateObject(object) {
        if (objectIds.indexOf(object.id) == -1) {
            data.push(object)

            // Add it at the right location
            if (sortBy == "") {
                objectIds.push(object.id)
                query.append({'modelData': object, "section": object.valueForKey(groupBy)})
            } else {
                sort()

                var index = objectIds.indexOf(object.id)
                query.insert(index, {'modelData': object, "section": object.valueForKey(groupBy)})
            }
        } else {
            var currentIndex = objectIds.indexOf(object.id)

            query.data[currentIndex] = object
            sort()

            var newIndex = objectIds.indexOf(object.id)

            query.move(currentIndex, newIndex, 1)
            query.set(newIndex, {'modelData': object, "section": object.valueForKey(groupBy)})
        }
    }

    function listOfIds(objects) {
        return objects.map(function(object) { return object.id })
    }

    function at(index) {
        return data[index]
    }

    function removeId(id) {
        query.remove(objectIds.indexOf(id))
        objectIds.splice(objectIds.indexOf(id), 1)
        data.splice(data.indexOf(id), 1)
    }
}
