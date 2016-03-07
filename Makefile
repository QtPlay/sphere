SRC = $(wildcard src/*.js src/*.qml)
OUT = $(SRC:src/%.js=build/%.js) $(SRC:src/%.qml=build/%.qml)

TEST_SRC = tests/models.js
TEST_OUT = $(TEST_SRC:tests/%.js=tests/build/%.js)

INSTALL_DIR = $(shell qmake -query QT_INSTALL_QML)/Sphere

all: build

run: all
	qmlscene build/main.qml -I /usr/local/lib/qml

install: all
	mkdir -p $(INSTALL_DIR)
	cp build/* src/qmldir $(INSTALL_DIR)

build: $(OUT)

build/%.qml: src/%.qml
	cp $< $@

build/%.js: src/%.js qmlify .babelrc
	mkdir -p $(@D)
	babel $< -o $@
	qmlify $@

test: all $(TEST_OUT)
	rm -f ~/Library/Application\ Support/qmltestrunner/QML/OfflineStorage/Databases/*
	qmltestrunner

tests/build/%.js: tests/%.js qmlify .babelrc
	mkdir -p $(@D)
	babel $< -o $@
	qmlify $@
