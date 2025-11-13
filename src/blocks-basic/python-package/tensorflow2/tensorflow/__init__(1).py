# A port of the Brython's Turtle module to Basthon by Romain Casati
# under the GPLv3 License.
#
# A revised version of CPython's turtle module written for Brython
#

# Note: This version is not intended to be used in interactive mode,
# nor use help() to look up methods/functions definitions. The docstrings
# have thus been shortened considerably as compared with the CPython's version.
#
# All public methods/functions of the CPython version should exist, if only
# to print out a warning that they are not implemented. The intent is to make
# it easier to "port" any existing turtle program from CPython to the browser.
#
# IMPORTANT: We use SVG for drawing turtles. If we have a turtle at an angle
# of 350 degrees and we rotate it by an additional 20 degrees, we will have
# a turtle at an angle of 370 degrees.  For turtles drawn periodically on
# a screen (like typical animations, including the CPython turtle module),
# drawing a turtle with a rotation of 370 degrees is the same as a rotation of
# 10 degrees.  However, using SVG, if we "slowly" animate an object,
# rotating it from 350 to 370 degrees, the result will not be the same
# as rotating it from 350 to 10 degrees. For this reason, we did not use the
# Vec2D class from the CPython module and handle the rotations quite differently.

import js
from pyodide.ffi import to_js, JsProxy
import inspect


class TfProxy(object):
    """
    由于JsProxy无法被继承, 因此采用代理模式, 重写magic方法
    """
    def __init__(self, obj):
        self.obj = obj

    def __getattribute__(self, name):
        # print(name) 
        return TfProxy(object.__getattribute__(self, "obj").__getattribute__(name))

    def __dir__(self):
        return dir(object.__getattribute__(self, "obj")) 
    
    def __call__(self, *args, **kwargs):
        args = [to_js(i) for i in args]
        kwargs={k:to_js(v) for k, v in kwargs.items()}
        return object.__getattribute__(self, "obj").__call__(*args, **kwargs)

tf = TfProxy(js.tf)

# class Tensorflow(object):
#     _tf = None
#     def __init__(self):
#         pass

#     def tensor(self, a):
#         if not isinstance(a, JsProxy):
#             return tf.tensor(to_js(a))
#         return tf.tensor(a)

#     def scalar(self, a):
#         if not isinstance(a, JsProxy):
#             return tf.scalar(to_js(a))
#         return tf.scalar(a)

#     def constant(self, a):
#         if not isinstance(a, JsProxy):
#             return tf.scalar(to_js(a))
#         return tf.scalar(a)

# train = tf.train


# def getmethparlist(ob):
#     """Get strings describing the arguments for the given object

#     Returns a pair of strings representing function parameter lists
#     including parenthesis.  The first string is suitable for use in
#     function definition and the second is suitable for use in function
#     call.  The "self" parameter is not included.
#     """
#     defText = callText = ""
#     # bit of a hack for methods - turn it into a function
#     # but we drop the "self" param.
#     # Try and build one for Python defined functions
#     args, varargs, varkw = inspect.getargs(ob.__code__)
#     items2 = args[1:]
#     realArgs = args[1:]
#     defaults = ob.__defaults__ or []
#     defaults = ["=%r" % (value,) for value in defaults]
#     defaults = [""] * (len(realArgs)-len(defaults)) + defaults
#     items1 = [arg + dflt for arg, dflt in zip(realArgs, defaults)]
#     if varargs is not None:
#         items1.append("*" + varargs)
#         items2.append("*" + varargs)
#     if varkw is not None:
#         items1.append("**" + varkw)
#         items2.append("**" + varkw)
#     defText = ", ".join(items1)
#     defText = "(%s)" % defText
#     callText = ", ".join(items2)
#     callText = "(%s)" % callText
#     return defText, callText


# __func_body = """\
# def {name}{paramslist}:
#     if {obj} is None:
#         {obj} = {init}
#     return {obj}.{name}{argslist}
# """


# def _make_global_funcs(functions, cls, obj, init):
#     for methodname in functions:
#         try:
#             method = getattr(cls, methodname)
#         except AttributeError:
#             print("methodname missing:", methodname)
#             continue
#         pl1, pl2 = getmethparlist(method)
#         defstr = __func_body.format(obj=obj, init=init, name=methodname,
#                                     paramslist=pl1, argslist=pl2)
#         exec(defstr, globals())


# _make_global_funcs(["tensor", "scalar", "constant", "data"], Tensorflow, 'Tensorflow._tf', 'Tensorflow()')

