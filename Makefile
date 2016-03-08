INSTALL_DIR = $(shell qmake -query QT_INSTALL_QML)/Sphere

.PHONY: build install check example

build:
	qmlify src build

install: build
	mkdir -p $(INSTALL_DIR)
	cp build/* src/qmldir $(INSTALL_DIR)

check: install
	qmlify tests/es6 tests/build/es6
	rm -rf tests/build/es5
	cp -r tests/es5 tests/build/es5
	rm -f ~/Library/Application\ Support/qmltestrunner/QML/OfflineStorage/Databases/*
	qmltestrunner -input tests/build

example: install
	qmlify example example/build
	rm -f ~/Library/Application\ Support/QtProject/QtQmlViewer/QML/OfflineStorage/Databases/*
	qmlscene example/build/main.qml
