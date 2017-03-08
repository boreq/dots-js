(function ($) {
    $.fn.dots = function (options) {
        var settings = $.extend({
            color: "#fff",
            backgroundColor: "#2c3e50",
            pointOpacity: 0.5,
            lineOpacity: 0.2,
            mouseLineOpacity: 1,
            speed: 50,
            size: 2,
            lineDistance: 200,
            maxPoints: 50,
            mouseSpawnNumber: 3
        }, options);

        var runEvery = 33;
        var spawnDistance = settings.size + 1;
        var boundsSize = Math.max(settings.lineDistance, 2 * spawnDistance);

        // Get canvas context
        var canvas = this[0];
        var ctx;
        if (canvas.getContext) {
            ctx = canvas.getContext('2d');
        } else {
            throw "Canvas is not supported in this browser";
        }

        // Initialize
        var points = [];
        var lines = [];
        var evt = null;

        this.on('mousemove', function(e) {
            evt = e;
        });

        this.on('mouseleave', function(e) {
            evt = null;
        });

        this.on('mouseleave', function(e) {
            evt = null;
        });

        this.on('click', function(e) {
            for (var i = 0; i < settings.mouseSpawnNumber; i++) {
                points.push(spawnMousePoint());
            }
        });

        // Create initial points
        fixCanvas();
        for (var i = 0; i < settings.maxPoints; i++) {
            points.push(spawnInitialPoint());
        }

        window.setTimeout(run, runEvery);

        function getMousePos() {
            if (evt === null) {
                return null;
            }
            var rect = canvas.getBoundingClientRect();
            return vector(evt.clientX - rect.left, evt.clientY - rect.top);
        }

        function vector(x, y) {
            return {
                x: x,
                y: y
            };
        }

        function distance(a, b) {
            return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
        }

        function length(v) {
            return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
        }

        function normalize(v) {
            var l = length(v);
            return vector(v.x / l, v.y / l);
        }

        function spawnInitialPoint() {
            var speed = normalize(vector(-1 + 2 * Math.random(), -1 + 2 * Math.random()));
            speed.x *= settings.speed;
            speed.y *= settings.speed;
            return {
                position: vector(canvas.width * Math.random(), canvas.height * Math.random()),
                speed: speed,
                size: Math.random() * settings.size + 1
            };
        }

        function spawnMousePoint() {
            var speed = normalize(vector(-1 + 2 * Math.random(), -1 + 2 * Math.random()));
            speed.x *= settings.speed;
            speed.y *= settings.speed;
            return {
                position: vector(getMousePos().x, getMousePos().y),
                speed: speed,
                size: Math.random() * settings.size + 1
            };
        }

        function spawnPoint() {
            function getPointPos() {
                // Spawn the point inside the rectangle
                var spawnX = canvas.width * Math.random();
                var spawnY = canvas.height * Math.random();

                // Move it behind the closest edge
                var distanceTop = spawnY;
                var distanceBottom = canvas.height - spawnY;
                var distanceLeft = spawnX;
                var distanceRight = canvas.width - spawnX;

                var distances = [distanceTop, distanceRight, distanceBottom, distanceLeft];
                var index = distances.indexOf(Math.min.apply(null, distances));
                if (index === 0) {
                    spawnY = -spawnDistance;
                }
                if (index === 1) {
                    spawnX = canvas.width + spawnDistance;
                }
                if (index === 2) {
                    spawnY = canvas.height + spawnDistance;
                }
                if (index === 3) {
                    spawnX = -spawnDistance;
                }
                return vector(spawnX, spawnY);
            }

            function getPointSpeed(position) {
                var speed;
                if (position.x <= 0) {
                    speed = vector(1, Math.random());
                }
                if (position.x >= canvas.width) {
                    speed = vector(-1, Math.random());
                }
                if (position.y <= 0) {
                    speed = vector(Math.random(), 1);
                }
                if (position.y >= canvas.height) {
                    speed = vector(Math.random(), -1);
                }

                speed = normalize(speed);
                speed.x *= settings.speed;
                speed.y *= settings.speed;
                return speed;
            }

            var position = getPointPos();
            var speed = getPointSpeed(position);
            return {
                position: position,
                speed: speed,
                size: Math.random() * settings.size + 1
            };
        }

        function outOfBounds(point) {
            if (point.position.x > canvas.width + boundsSize) {
                return true;
            }

            if (point.position.x < -boundsSize) {
                return true;
            }

            if (point.position.y > canvas.height + boundsSize) {
                return true;
            }

            if (point.position.y < -boundsSize) {
                return true;
            }

            return false;
        }

        function update(deltaTime) {
            fixCanvas();
            lines = [];

            if (points.length < settings.maxPoints) {
                points.push(spawnPoint());
            }

            for (var i = 0; i < points.length; i++) {
                var point = points[i];

                if (outOfBounds(point)) {
                    points.splice(i, 1);
                    continue;
                }

                point.position.x += point.speed.x * deltaTime;
                point.position.y += point.speed.y * deltaTime;

                var mousePos = getMousePos();
                if (mousePos !== null) {
                    var mouseDst = distance(mousePos, point.position);
                    if (mouseDst < settings.lineDistance) {
                        lines.push({
                            start: point.position,
                            end: mousePos,
                            transparency: settings.mouseLineOpacity * (1 - mouseDst / settings.lineDistance)
                        });
                    }
                }

                for (var j = 0; j < points.length; j++) {
                    if (i == j) {
                        continue;
                    }

                    var secondPoint = points[j];

                    var dst = distance(point.position, secondPoint.position);
                    if (dst < settings.lineDistance) {
                        lines.push({
                            start: point.position,
                            end: secondPoint.position,
                            transparency: settings.lineOpacity * (1 - dst / settings.lineDistance)
                        });
                    }
                }
            }
        }

        function clear() {
            ctx.fillStyle = settings.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        function fixCanvas() {
            var width = $(canvas).width();
            var height = $(canvas).height();
            $(canvas).attr('width', width);
            $(canvas).attr('height', height);
        }

        function draw() {
            clear();

            ctx.fillStyle = settings.color;
            ctx.strokeStyle = settings.color;
            ctx.globalAlpha = settings.pointOpacity;

            var i;

            for (i = 0; i < points.length; i++) {
                var point = points[i];
                ctx.beginPath();
                ctx.arc(point.position.x, point.position.y, point.size, 0, 2 * Math.PI, true);
                ctx.fill();
            }

            for (i = 0; i < lines.length; i++) {
                var line = lines[i];
                ctx.globalAlpha = line.transparency;
                ctx.beginPath();
                ctx.moveTo(line.start.x, line.start.y);
                ctx.lineTo(line.end.x, line.end.y);
                ctx.stroke();
            }
        }

        function run() {
            var deltaTime = runEvery / 1000;
            update(deltaTime);
            draw();
            window.setTimeout(run, runEvery);
        }

        return this;
    };
}(jQuery));
