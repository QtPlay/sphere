import QtQuick 2.5
import QtQuick.Controls 1.3
import QtQuick.Dialogs 1.2
import QtQuick.Layouts 1.2
import Sphere 0.1
import "main.js" as App

ApplicationWindow {
    title: "Sphere database demo"

    width: 300
    height: 400

    toolBar: ToolBar {
        RowLayout {
            anchors.fill: parent

            ToolButton {
                text: "Add"
                onClicked: newDocumentDialog.open()
            }

            Item {
                Layout.fillWidth: true
            }

            TextField {
                id: textField

                placeholderText: "Search..."
            }
        }
    }

    ListView {
        anchors.fill: parent
        model: query
        delegate: Item {
            height: 50
            width: parent.width

            Column {
                anchors {
                    left: parent.left
                    leftMargin: 16
                    verticalCenter: parent.verticalCenter
                }

                Label {
                    text: modelData.title
                }

                Label {
                    text: modelData.body
                    opacity: 0.75
                }
            }
        }
    }

    Query {
        id: query
        className: 'SampleDocument'
        where: textField.text ? ['title LIKE ?', '%' + textField.text + '%'] : []
        sortBy: 'title'
    }

    Label {
        anchors.centerIn: parent
        font.pointSize: 24
        opacity: 0.5

        text: "No documents yet"
        visible: query.count == 0 && query.where.length == 0
    }

    Label {
        anchors.centerIn: parent
        font.pointSize: 24
        opacity: 0.5

        text: "No matches"
        visible: query.count == 0 && query.where.length > 0
    }

    Dialog {
        id: newDocumentDialog

        title: "Create new Document"
        standardButtons: StandardButton.Save | StandardButton.Cancel

        ColumnLayout {
            spacing: 8

            width: parent ? parent.width : 100

            TextField {
                id: titleTextField
                placeholderText: "Title"
                Layout.fillWidth: true
            }

            TextArea {
                id: bodyTextArea
                Layout.fillWidth: true
            }
        }

        onAccepted: {
            var document = new App.SampleDocument(titleTextField.text, bodyTextArea.text)
            document.save()
        }
    }
}
