/**
 * some helper functions
 */

class Util {
    /**
     * find the intersection point between two line, return null if they don't intersect
     * 
     * @param {Vector} p0 an object with x, y property denoting a point, can be a p5.Vector object
     * @param {Vector} p1 an object with x, y property denoting a point, can be a p5.Vector object
     * @param {Vector} p2 an object with x, y property denoting a point, can be a p5.Vector object
     * @param {Vector} p3 an object with x, y property denoting a point, can be a p5.Vector object
     * @param {boolean} segment if true, check only if line segments defined by the point intersect, default is false
     * @returns the intersection point 
     */
    static lineIntersection(p0, p1, p2, p3, segment = false) {
        let A1 = p1.y - p0.y;
        let B1 = p0.x - p1.x;
        let C1 = A1 * p0.x + B1 * p0.y;
        let A2 = p3.y - p2.y;
        let B2 = p2.x - p3.x;
        let C2 = A2 * p2.x + B2 * p2.y;
        let d = A1 * B2 - A2 * B1;
        if (d === 0) return null;
        let x = (B2 * C1 - B1 * C2) / d, y = (A1 * C2 - A2 * C1) / d;
        if (segment) {
            let rx = (x - p0.x) / (p1.x - p0.x);
            let ry = (y - p0.y) / (p1.y - p0.y);
            if ((rx >= 0 && rx <= 1) || (ry >= 0 && ry <= 1)) {
                return { x: x, y: y };
            } else {
                return null;
            }
        }
        return { x: x, y: y };
    }

    /**
     * find the intersection points between a line and a circle, return null if they don't intersect
     * 
     * @param {Vector} p1 an object with x, y property denoting a point, can be a p5.Vector object
     * @param {Vector} p2 an object with x, y property denoting a point, can be a p5.Vector object
     * @param {Vector} center an object with x, y property denoting a point, can be a p5.Vector object
     * @param {number} r radius of the circle
     * @param {boolean} internal flag for calling this internally within the library, return only info needed
     * @returns an array of two points or null
     */
    static lineCircleIntersection(p1, p2, center, r, internal = false) {
        let a, b, c, bb4ac;
        let dp = { x: 0, y: 0 }
        dp.x = p2.x - p1.x;
        dp.y = p2.y - p1.y;
        a = dp.x * dp.x + dp.y * dp.y;
        b = 2 * (dp.x * (p1.x - center.x) + dp.y * (p1.y - center.y));
        c = center.x * center.x + center.y * center.y;
        c += p1.x * p1.x + p1.y * p1.y;
        c -= 2 * (center.x * p1.x + center.y * p1.y);
        c -= r * r;
        bb4ac = b * b - 4 * a * c;
        if (bb4ac < 0) return null;
        if (internal) {
            return { b: (-b - Math.sqrt(bb4ac)) / (2 * a) };
        }
        let mu1 = (-b + sqrt(bb4ac)) / (2 * a);
        let mu2 = (-b - sqrt(bb4ac)) / (2 * a);
        return [{ x: p1.x + mu1 * (p2.x - p1.x), y: p1.y + mu1 * (p2.y - p1.y) }, { x: p1.x + mu2 * (p2.x - p1.x), y: p1.y + mu2 * (p2.y - p1.y) }];
    }

    /**
     * rotate an vector by an angle, return a new object {x, y}
     * @param {Vector} v 
     * @param {number} ang 
     * @returns new vector 
     */
    static rotateVector(v, ang) {
        return {
            x: v.x * Math.cos(ang) - v.y * Math.sin(ang),
            y: v.x * Math.sin(ang) + v.y * Math.cos(ang)
        }
    }

    static combineSort(order, dist, amount) {
        let gap = amount;
        let swapped = false;
        while (gap > 1 || swapped) {
            gap = Math.floor((gap * 10) / 13);
            if (gap == 9 || gap == 10) {
                gap = 11;
            }
            if (gap < 1) {
                gap = 1;
            }
            swapped = false;
            for (let i = 0; i < amount - gap; i++) {
                let j = i + gap;
                if (dist[i] < dist[j]) {
                    [dist[i], dist[j]] = [dist[j], dist[i]]; //Swap distances
                    [order[i], order[j]] = [order[j], order[i]]; //Swap sort order
                    swapped = true;
                }
            }
        }
    }

    static normalize(v) {
        let ms = v.x * v.x + v.y * v.y
        if (ms === 1) return { x: v.x, y: v.y };
        return { x: v.x / Math.sqrt(ms), y: v.y / Math.sqrt(ms) };

    }
}

export default Util;