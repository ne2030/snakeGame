const createNode = v => ({
    value: v,
    next: null,
});

const createLinkedList = (comparator) => {
    let tail = null;
    let head = null;

    const list = Object.defineProperties({}, {
        tail: { get: () => tail },
        head: { get: () => head },
    });

    const init = (v) => {
        tail = head = v;
        return list;
    };

    list.setHead = h => (tail = h, list);
    list.setTail = t => (head = t, list);


    list.append = (v) => {
        const n = createNode(v);
        if (head == null) return init(n);
        head.next = n;
        head = n;
        return list;
    };

    list.prepend = (v) => {
        const n = createNode(v);
        if (head == null) return init(n);
        n.next = tail;
        tail = n;
        return list;
    };

    list.contains = (v) => {
        let n = tail;
        while (n != null && !comparator(n.value, v)) {
            n = n.next;
        }
        return n !== null;
    };

    list.delete = (v) => {
        if (comparator(v, tail.value)) {
            tail = tail.next;
            return true;
        }
        let n = tail;
        while (n != null && !comparator(n.next.value, v)) {
            n = n.next;
        }

        if (n == null) return false;
        n.next = n.next.next;

        if (n.next == null) head = n;
        return true;
    };

    list.deleteTail = () => {
        if (head == null) return true;
        if (tail == head) {
            head = tail = null;
            return true;
        }

        tail = tail.next;
        return true;
    };

    list.toArray = () => {
        const xs = [];
        let n = tail;
        while (n) {
            xs.push(n.value);
            n = n.next;
        }
        return xs;
    };

    return list;
};

export default createLinkedList;
