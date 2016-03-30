include(qmlify.pri)

TEMPLATE = lib

QMLIFY += src

target.path = $$[QT_INSTALL_QML]/Sphere

qml.files += src/qmldir \
             build/src-qmlified/*
qml.path = $$[QT_INSTALL_QML]/Sphere

INSTALLS += target qml
