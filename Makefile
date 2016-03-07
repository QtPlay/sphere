INSTALL_DIR = $(shell qmake -query QT_INSTALL_QML)/Sphere

.PHONY: build tests examples run_es5 run_es6

build:
	qmlify src build

install: build
	mkdir -p $(INSTALL_DIR)
	cp build/* src/qmldir $(INSTALL_DIR)

check: install
	qmlify tests/es6 tests/es6/build
	rm -f ~/Library/Application\ Support/qmltestrunner/QML/OfflineStorage/Databases/*
	qmltestrunner tests/es5 tests/es6/build

examples: build
	qmlify examples/es6 examples/es6/build

run_es6: examples
	qmlscene examples/es6/build/main.qml

run_es5: examples
	qmlscene examples/es4/main.qml
