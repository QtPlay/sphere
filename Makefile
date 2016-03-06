SRC = $(wildcard src/*.js src/*.qml)
OUT = $(SRC:src/%.js=build/%.js) $(SRC:src/%.qml=build/%.qml)

all: build

run: all
	qmlscene build/main.qml -I /usr/local/lib/qml

build: $(OUT)

build/%.qml: src/%.qml
	cp $< $@

build/%.js: src/%.js qmlify .babelrc
	mkdir -p $(@D)
	babel $< -o $@
	qmlify $@

test: all
	rm -f ~/Library/Application\ Support/qmltestrunner/QML/OfflineStorage/Databases/*
	qmltestrunner
