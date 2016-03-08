import QtQuick 2.0
import Sphere 0.1

QtObject {
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

    property int count: 0

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

        reload()
    }

    onClassObjectChanged: reload()

    Component.onCompleted: {
        reload()

        Sphere.objectChanged.connect(function(className, object) {
            if (className !== query.className)
                return

            reload()
        })

        Sphere.objectDeleted.connect(function(className, object) {
            if (className !== query.className)
                return

            reload()
        })
    }

    function reload() {
        if (!classObject)
            return

        count = classObject.count(query.filter, query.args)
    }
}
