SRC = $(wildcard src/*.js src/*.qml)
OUT = $(SRC:src/%.js=build/%.js) $(SRC:src/%.qml=build/%.qml)

run: build
	qmlscene build/main.qml
build: $(OUT)
build/%.qml: src/%.qml
	cp $< $@
build/%.js: src/%.js qmlify .babelrc
	mkdir -p $(@D)
	babel $< -o $@
	qmlify $@
