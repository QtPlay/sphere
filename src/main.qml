import QtQuick 2.5
import "main.js" as App

Item {
    // property string searchText
    //
    // ListView {
    //     model: query
    // }
    //
    // Query {
    //     id: query
    //     where: searchText ? ['title = ?', searchText] : []
    //     sortBy: 'title'
    // }
    //
    // function addDocument(title, body) {
    //     var document = new Model.SampleDocument()
    //     document.title = title
    //     document.body = body
    //     document.save()
    // }

    Component.onCompleted: {
        var documents = App.SampleDocument.find()
        documents.forEach(function(document) {
            console.log(document.id, document.title, document.body)
        })

        var document = documents[0]
        document.title = 'Goodbye'
        document.save()

        var documents = App.SampleDocument.find()
        documents.forEach(function(document) {
            console.log(document.id, document.title, document.body)
        })

        document.delete()

        var documents = App.SampleDocument.find()
        documents.forEach(function(document) {
            console.log(document.id, document.title, document.body)
        })
    }
}
