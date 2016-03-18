INSTALL_DIR = $(shell qmake -query QT_INSTALL_QML)/Sphere

.PHONY: build install check example

build:
	qmlify -d build src

install: build
	mkdir -p $(INSTALL_DIR)
	cp build/* src/qmldir $(INSTALL_DIR)

check: install
	qmlify -d test/build/es6 test/es6
	rm -rf test/build/es5
	cp -r test/es5 test/build/es5
	rm -f ~/Library/Application\ Support/qmltestrunner/QML/OfflineStorage/Databases/*
	qmltestrunner -input test/build

example: install
	qmlify example example/build
	rm -f ~/Library/Application\ Support/QtProject/QtQmlViewer/QML/OfflineStorage/Databases/*
	qmlscene example/build/main.qml
