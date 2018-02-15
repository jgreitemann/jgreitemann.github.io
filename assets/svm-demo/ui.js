var eps = 0.001;
var add_point;
var clear_points;
var get_model;
var get_SV_coord;

var Module = {
    preRun: [],
    postRun: function () {
        add_point = Module.cwrap('add_point', null, ['number', 'number', 'number']);
        clear_points = Module.cwrap('clear_points', null, []);
        get_model = {
            'linear': Module.cwrap('get_model_linear', 'number', ['number', 'number', 'number']),
            'quadratic': Module.cwrap('get_model_quadratic', 'number', ['number', 'number', 'number']),
            'rbf': Module.cwrap('get_model_rbf', 'number', ['number', 'number', 'number']),
            'sigmoid': Module.cwrap('get_model_sigmoid', 'number', ['number', 'number', 'number'])
        };
        get_SV_coord = Module.cwrap('get_SV_coord', 'number', ['number']);

        get_n_lines_zero = Module.cwrap('get_n_lines_zero', 'number', []);
        get_n_line_points_zero = Module.cwrap('get_n_line_points_zero', 'number', ['number']);
        get_line_points_zero = Module.cwrap('get_line_points_zero', 'number', ['number']);
        get_line_closed_zero = Module.cwrap('get_line_closed_zero', 'number', ['number']);

        get_n_lines_plus = Module.cwrap('get_n_lines_plus', 'number', []);
        get_n_line_points_plus = Module.cwrap('get_n_line_points_plus', 'number', ['number']);
        get_line_points_plus = Module.cwrap('get_line_points_plus', 'number', ['number']);
        get_line_closed_plus = Module.cwrap('get_line_closed_plus', 'number', ['number']);

        get_n_lines_minus = Module.cwrap('get_n_lines_minus', 'number', []);
        get_n_line_points_minus = Module.cwrap('get_n_line_points_minus', 'number', ['number']);
        get_line_points_minus = Module.cwrap('get_line_points_minus', 'number', ['number']);
        get_line_closed_minus = Module.cwrap('get_line_closed_minus', 'number', ['number']);
    },
    print: function (text) {
        console.log(text);
    },
    totalDependencies: 0
};

var nice = [];
var naughty = [];

window.onload = function () {
    var nu_text = document.getElementById('nu-text');
    var nu_slider = document.getElementById('nu-slider');
    var nu = parseFloat(nu_text.value);
    var SVcheckbox = document.getElementById('SVcheckbox');
    var kernel_picker = document.getElementById('kernel-picker');
    var gamma_text = document.getElementById('gamma-text');
    var c0_text = document.getElementById('c0-text');
    var primary = 1;

    var formulae = {
        'linear': document.getElementById('linear-kernel-formula'),
        'quadratic': document.getElementById('quadratic-kernel-formula'),
        'rbf': document.getElementById('rbf-kernel-formula'),
        'sigmoid': document.getElementById('sigmoid-kernel-formula')
    };

    var warning = document.getElementById('two-class-warning');
    var exception_box = document.getElementById('exception');
    var exception_text = document.getElementById('exception-text');

    function show_exception (text) {
        exception_text.innerHTML = text;
        exception_box.style = 'display: visible;';
    }
    function hide_exception () {
        exception_text.innerHTML = '';
        exception_box.style = 'display: none;';
    }
    hide_exception();

    function update_slider () {
        nu_slider.value = nu * 100;
    }
    update_slider();

    var canvas = document.getElementById('canvas');
    var boundingRect = {
        origin: { x: -3.5, y: -2. },
        size: { width: 7., height: 4. }
    };

    var ctx = canvas.getContext('2d');

    function getMousePos(evt) {
        var rect = canvas.getBoundingClientRect();
        var sx = canvas.width / boundingRect.size.width;
        var sy = canvas.height / boundingRect.size.height;
        var mx = canvas.width / 2.;
        var my = canvas.height / 2.;
        return {
            x: (evt.clientX - rect.left - mx) / sx,
            y: (evt.clientY - rect.top - my) / sy
        };
    }

    function edge_index(x, y) {
        if (Math.abs(x - boundingRect.origin.x) < eps)
            return 3;
        if (Math.abs(y - boundingRect.origin.y) < eps)
            return 0;
        if (Math.abs(x - boundingRect.origin.x - boundingRect.size.width) < eps)
            return 1;
        if (Math.abs(y - boundingRect.origin.y - boundingRect.size.height) < eps)
            return 2;
        return -1;
    }

    function traverse_boundary(ax, ay, bx, by, dir) {
        var start_edge = edge_index(ax, ay);
        var target_edge = edge_index(bx, by);
        var current_edge = start_edge;
        var x = ax, y = ay;
        while (current_edge != target_edge) {
            if (dir == 'ccw') {
                switch (current_edge) {
                case 0:
                    x = boundingRect.origin.x;
                    break;
                case 1:
                    y = boundingRect.origin.y;
                    break;
                case 2:
                    x = boundingRect.origin.x + boundingRect.size.width;
                    break;
                case 3:
                    y = boundingRect.origin.y + boundingRect.size.height;
                    break;
                }
                ctx.lineTo(x, y);
                current_edge = (current_edge + 3) % 4;
            } else {
                switch (current_edge) {
                case 0:
                    x = boundingRect.origin.x + boundingRect.size.width;
                    break;
                case 1:
                    y = boundingRect.origin.y + boundingRect.size.height;
                    break;
                case 2:
                    x = boundingRect.origin.x;
                    break;
                case 3:
                    y = boundingRect.origin.y;
                    break;
                }
                ctx.lineTo(x, y);
                current_edge = (current_edge + 1) % 4;
            }
        }
        ctx.lineTo(bx, by);
    }

    function update_active_parameters() {
        gamma_text.disabled = kernel_picker.value === 'linear';
        c0_text.disabled = (kernel_picker.value === 'linear'
                            || kernel_picker.value === 'rbf');
        for (var other in formulae) {
            if (other === kernel_picker.value)
                formulae[other].style = 'display: visible;';
            else
                formulae[other].style = 'display: none;';
        }
    }

    function resize () {
        var rect = document.getElementById('layers').getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.width = rect.width;
        canvas.style.height = rect.height;
    };

    function redraw(bare) {
        resize();

        var sx = canvas.width / boundingRect.size.width;
        var sy = canvas.height / boundingRect.size.height;
        var mx = canvas.width / 2.;
        var my = canvas.height / 2.;
        ctx.setTransform(sx, 0, 0, sy, mx, my);
        ctx.clearRect(boundingRect.origin.x, boundingRect.origin.y,
                      boundingRect.size.width, boundingRect.size.height);

        var r = 0.03;

        if (!bare && nice.length > 0 && naughty.length > 0) {
            warning.style = "display: none;";
            var kernel_name = kernel_picker.value;
            var gamma = parseFloat(gamma_text.value);
            var c0 = parseFloat(c0_text.value);
            if (!(kernel_name in get_model))
                alert('Unknown kernel: ' + kernel_name);
            var res = get_model[kernel_name](nu, gamma, c0);
            if (res != -1) {
                hide_exception();

                ctx.strokeStyle = '#999999';
                ctx.lineWidth = 0.005;
                ctx.fillStyle = '#dddddd';
                var a, b, rho;
                if (res == 1) {
                    var ptr = Module.ccall('get_model_coeffs', 'number', [], []);
                    a = Module.getValue(ptr, 'double');
                    b = Module.getValue(ptr+8, 'double');
                    rho = Module.getValue(ptr+16, 'double');
                    console.log('a = ' + a + ', b = ' + b + ', rho = ' + rho);

                    ctx.beginPath();
                    ctx.moveTo(boundingRect.origin.x,
                               (rho - 1 - a * boundingRect.origin.x) / b);
                    ctx.lineTo(boundingRect.origin.x + boundingRect.size.width,
                               (rho - 1 - a * (boundingRect.origin.x + boundingRect.size.width)) / b);
                    ctx.lineTo(boundingRect.origin.x + boundingRect.size.width,
                               (rho + 1 - a * (boundingRect.origin.x + boundingRect.size.width)) / b);
                    ctx.lineTo(boundingRect.origin.x,
                               (rho + 1 - a * boundingRect.origin.x) / b);
                    ctx.fill();
                    ctx.stroke();
                } else {
                    // get trail point
                    var tx = 0, ty = 0;
                    if (get_n_lines_zero() > 0) {
                        var ptr = get_line_points_zero(0);
                        tx = Module.getValue(ptr + 16, 'double');
                        ty = Module.getValue(ptr + 24, 'double');
                    }

                    ctx.beginPath();
                    {
                        var n_lines = get_n_lines_minus();
                        for (var i = 0; i < n_lines; ++i) {
                            var n_pt = get_n_line_points_minus(i);
                            var ptr = get_line_points_minus(i);
                            ctx.moveTo(Module.getValue(ptr, 'double'),
                                       Module.getValue(ptr + 8, 'double'));
                            for (var j = 1; j < n_pt; ++j) {
                                ctx.lineTo(Module.getValue(ptr + 16*j, 'double'),
                                           Module.getValue(ptr + 16*j + 8, 'double'));
                            }
                            if (get_line_closed_minus(i)) {
                                ctx.lineTo(Module.getValue(ptr, 'double'),
                                           Module.getValue(ptr + 8, 'double'));
                            } else {
                                traverse_boundary(Module.getValue(ptr + 16*(n_pt-1), 'double'),
                                                  Module.getValue(ptr + 16*(n_pt-1) + 8, 'double'),
                                                  Module.getValue(ptr, 'double'),
                                                  Module.getValue(ptr + 8, 'double'),
                                                  'ccw');
                            }
                        }
                    }
                    {
                        var n_lines = get_n_lines_plus();
                        for (var i = 0; i < n_lines; ++i) {
                            var n_pt = get_n_line_points_plus(i);
                            var ptr = get_line_points_plus(i);
                            ctx.moveTo(Module.getValue(ptr, 'double'),
                                       Module.getValue(ptr + 8, 'double'));
                            for (var j = 1; j < n_pt; ++j) {
                                ctx.lineTo(Module.getValue(ptr + 16*j, 'double'),
                                           Module.getValue(ptr + 16*j + 8, 'double'));
                            }
                            if (get_line_closed_plus(i)) {
                                ctx.lineTo(Module.getValue(ptr, 'double'),
                                           Module.getValue(ptr + 8, 'double'));
                            } else {
                                traverse_boundary(Module.getValue(ptr + 16*(n_pt-1), 'double'),
                                                  Module.getValue(ptr + 16*(n_pt-1) + 8, 'double'),
                                                  Module.getValue(ptr, 'double'),
                                                  Module.getValue(ptr + 8, 'double'),
                                                  'ccw');
                            }
                        }
                    }

                    // isPointInPath uses canvas coordinate space: undo transform
                    var ttx = tx * sx + mx;
                    var tty = ty * sy + my;
                    if (!ctx.isPointInPath(ttx, tty, 'evenodd')) {
                        ctx.rect(boundingRect.origin.x, boundingRect.origin.y,
                                 boundingRect.size.width, boundingRect.size.height);
                    }
                    ctx.fill('evenodd');
                    ctx.stroke();
                }

                ctx.strokeStyle = 'black';
                ctx.lineWidth = 0.01;
                if (res == 1) {
                    ctx.beginPath();
                    ctx.moveTo(boundingRect.origin.x,
                               (rho - a * boundingRect.origin.x) / b);
                    ctx.lineTo(boundingRect.origin.x + boundingRect.size.width,
                               (rho - a * (boundingRect.origin.x + boundingRect.size.width)) / b);
                    ctx.stroke();
                } else {
                    var n_lines = get_n_lines_zero();
                    for (var i = 0; i < n_lines; ++i) {
                        var n_pt = get_n_line_points_zero(i);
                        var ptr = get_line_points_zero(i);
                        ctx.beginPath();
                        ctx.moveTo(Module.getValue(ptr, 'double'),
                                   Module.getValue(ptr + 8, 'double'));
                        for (var j = 1; j < n_pt; ++j) {
                            ctx.lineTo(Module.getValue(ptr + 16*j, 'double'),
                                       Module.getValue(ptr + 16*j + 8, 'double'));
                        }
                        if (get_line_closed_zero(i)) {
                            ctx.closePath();
                        }
                        ctx.stroke();
                    }
                }
            } else {
                except_str = Module.ccall('get_err_string', 'string', [], []);
                show_exception(except_str);
            }
        } else {
            warning.style = "display: visible;";
        }

        // coordinate system
        ctx.strokeStyle = 'darkgray';
        ctx.lineWidth = 0.0025;
        ctx.setLineDash([0.01, 0.02]);
        ctx.beginPath();
        for (var y = Math.ceil(boundingRect.origin.y);
             y < boundingRect.origin.y + boundingRect.size.height; y += 1.) {
            if (Math.abs(y) > eps) {
                ctx.moveTo(boundingRect.origin.x, y);
                ctx.lineTo(boundingRect.origin.x + boundingRect.size.width, y);
            }
        }
        for (var x = Math.ceil(boundingRect.origin.x);
             x < boundingRect.origin.x + boundingRect.size.width; x += 1.) {
            if (Math.abs(x) > eps) {
                ctx.moveTo(x, boundingRect.origin.y);
                ctx.lineTo(x, boundingRect.origin.y + boundingRect.size.height);
            }
        }
        ctx.stroke();
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 0.0025;
        ctx.setLineDash([0.05, 0.05]);
        ctx.beginPath();
        ctx.moveTo(boundingRect.origin.x, 0);
        ctx.lineTo(boundingRect.origin.x + boundingRect.size.width, 0);
        ctx.moveTo(0, boundingRect.origin.y);
        ctx.lineTo(0, boundingRect.origin.y + boundingRect.size.height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'green';
        nice.forEach(function (pt) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, r, 0, 2*Math.PI, false);
            ctx.fill();
        });
        ctx.fillStyle = 'red';
        naughty.forEach(function (pt) {
            ctx.fillRect(pt.x - r, pt.y - r, 2*r, 2*r);
        });

        if (!bare && SVcheckbox.checked) {
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 0.006;
            var SV_ptr;
            for (var i = 0; SV_ptr = get_SV_coord(i); ++i) {
                var SV_x = Module.getValue(SV_ptr, 'double');
                var SV_y = Module.getValue(SV_ptr+8, 'double');
                ctx.beginPath();
                ctx.arc(SV_x, SV_y, 1.5*r, 0, 2*Math.PI, false);
                ctx.stroke();
            }
        }
    }

    window.onresize = function (event) {
        redraw(false);
    };

    canvas.oncontextmenu = function () { return false; };
    canvas.addEventListener('mousedown', function (event) {
        var pos = getMousePos(event);

        console.log(pos.x + ', ' + pos.y + ': ' + event.button);

        var label = ((event.button == 0) ? 1 : -1) * primary;
        if (label > 0) {
            nice.push(pos);
        } else {
            naughty.push(pos);
        }

        add_point(pos.x, pos.y, label);

        redraw(false);
    }, false);

    nu_text.onchange = function (event) {
        nu = parseFloat(nu_text.value);
        if (nu != NaN) {
            nu_text.value = nu;
            update_slider();
            redraw(false);
        } else {
            alert('Invalid number');
        }
    };

    nu_slider.oninput = function (event) {
        nu = 0.01 * nu_slider.value;
        nu_text.value = nu;
        redraw(false);
    };

    SVcheckbox.onclick = function (event) {
        redraw(false);
    };

    document.getElementById('class-toggle').onclick = function (event) {
        document.getElementById('class-toggle').classList.toggle('toggled');
        primary *= -1;
    }

    document.getElementById('clear-button').onclick = function (event) {
        nice = [];
        naughty = [];
        clear_points();
        hide_exception();
        redraw(false);
    };

    kernel_picker.onclick = function (event) {
        update_active_parameters();
        redraw(false);
    };

    gamma_text.onclick = function (event) { gamma_text.select(); };
    gamma_text.onchange = function (event) {
        gamma = parseFloat(gamma_text.value);
        if (gamma != NaN) {
            gamma_text.value = gamma;
            redraw(false);
        } else {
            alert('Invalid number');
        }
        gamma_text.select();
    };

    c0_text.onclick = function (event) { c0_text.select(); };
    c0_text.onchange = function (event) {
        c0 = parseFloat(c0_text.value);
        if (c0 != NaN) {
            c0_text.value = c0;
            redraw(false);
        } else {
            alert('Invalid number');
        }
        c0_text.select();
    };

    update_active_parameters();
    redraw(true);
};
