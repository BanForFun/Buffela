package gr.elaevents.buffela.utils

private data class Node<T>(
    var value: T,
    var next: Node<T>? = null
)

private class LinkedListIterator<T>(private var current: Node<T>?): Iterator<T> {
    override fun hasNext(): Boolean {
        return current != null
    }

    override fun next(): T {
        if (!hasNext()) throw NoSuchElementException()

        val value = current!!.value
        current = current?.next
        return value
    }
}

class LinkedList<T> : Iterable<T> {
    private var head: Node<T>? = null
    private var tail: Node<T>? = null

    val isEmpty: Boolean
        get() = head == null

    fun append(value: T) {
        val newNode = Node(value)
        if (isEmpty) {
            head = newNode
            tail = newNode
        } else {
            tail?.next = newNode
            tail = newNode
        }
    }

    override fun iterator(): Iterator<T> {
        return LinkedListIterator(head)
    }
}