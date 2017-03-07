# dots.js
A small jQuery library inspired by an effect that I've seen.

https://boreq.github.io/dots-js

## Basic usage

    $(function() {
        $('#canvas').dots();
    });

## Settings

    $(function() {
        $('#canvas').dots({
            color: '#ff0000'
        });
    });

## Default settings

    {
        color: "#fff",
        backgroundColor: "#2c3e50",
        pointOpacity: 0.5,
        lineOpacity: 0.2,
        mouseLineOpacity: 1,
        speed: 50,
        size: 2,
        lineDistance: 200,
        maxPoints: 50
    }
