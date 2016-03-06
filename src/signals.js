class Signal {
    listeners = []

    connect(listener) {
        this.listeners.push(listener)
    }

    emit(...args) {
        this.listeners.forEach((listener) => {
            listener.apply(null, args)
        })
    }
}

export const objectChanged = new Signal()
export const objectDeleted = new Signal()
