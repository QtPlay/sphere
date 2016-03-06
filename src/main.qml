import QtQuick 2.5
import Material 0.1
import Material.ListItems 0.1 as ListItem
import "main.js" as App

Item {
    width: 300
    height: 400

    ListView {
        anchors.fill: parent
        model: query
        delegate: ListItem.Subtitled {
            text: modelData.title
            subText: modelData.body
        }
    }

    TextField {
        id: textField

        placeholderText: "Search..."

        anchors {
            bottom: parent.bottom
            left: parent.left
            right: parent.right
            margins: Units.dp(8)
        }
    }

    Query {
        id: query
        className: 'SampleDocument'
        where: textField.text ? ['title LIKE ?', '%' + textField.text + '%'] : undefined
        sortBy: 'title'
    }
}
