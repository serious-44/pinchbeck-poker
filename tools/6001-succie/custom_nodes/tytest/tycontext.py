
import torch


class TyContext:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "optional": {
                "in_context": ("*", {"tooltip": "A map {name: value}."}),
                "in_1": ("*", {}),
                "in_1_name": ("STRING", {"tooltip": "Name for 1. input."}),
                "in_2": ("*", {}),
                "in_2_name": ("STRING", {"tooltip": "Name for 2. input."}),
                "in_3": ("*", {}),
                "in_3_name": ("STRING", {"tooltip": "Name for 3. input."}),
                "in_4": ("*", {}),
                "in_4_name": ("STRING", {"tooltip": "Name for 4. input."}),
                "in_5": ("*", {}),
                "in_5_name": ("STRING", {"tooltip": "Name for 5. input."}),
            },
        }
 
    RETURN_TYPES = ('*',)
    RETURN_NAMES = ('context',)
 
    FUNCTION = "execute"
 
    CATEGORY = "tytest"
 
    def execute(self, in_context = None, in_1_name = "", in_2_name = "", in_3_name = "", in_4_name = "", in_5_name = "", in_1 = None, in_2 = None, in_3 = None, in_4 = None, in_5 = None):
        if in_context == None:
            in_context = {}
        if in_1 != None or in_2 != None or in_3 != None or in_4 != None or in_5 != None:
            in_context = in_context.copy()
            if in_1 != None:
                in_context[in_1_name] = in_1
            if in_2 != None:
                in_context[in_2_name] = in_2
            if in_3 != None:
                in_context[in_3_name] = in_3
            if in_4 != None:
                in_context[in_4_name] = in_4
            if in_5 != None:
                in_context[in_5_name] = in_5
        return (in_context,)


class TyContextInt:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
                "name": ("STRING", {"tooltip": "Name of the item to output."}),
            },
        }
 
    RETURN_TYPES = ('INT',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, context, name):
        result = context[name] if name in context else None
        return (result,)
    

class TyContextFloat:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
                "name": ("STRING", {"tooltip": "Name of the item to output."}),
            },
        }
 
    RETURN_TYPES = ('FLOAT',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, context, name):
        result = context[name] if name in context else None
        return (result,)


class TyContextString:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
                "name": ("STRING", {"tooltip": "Name of the item to output."}),
            },
        }
 
    RETURN_TYPES = ('STRING',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, context, name):
        result = context[name] if name in context else None
        return (result,)


class TyContextBoolean:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
                "name": ("STRING", {"tooltip": "Name of the item to output."}),
            },
        }
 
    RETURN_TYPES = ('BOOLEAN',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, context, name):
        result = context[name] if name in context else None
        return (result,)


class TyContextImage:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
                "name": ("STRING", {"tooltip": "Name of the item to output."}),
            },
        }
 
    RETURN_TYPES = ('IMAGE',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, context, name):
        result = context[name] if name in context else None
        return (result,)


class TyContextLatent:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
                "name": ("STRING", {"tooltip": "Name of the item to output."}),
            },
        }
 
    RETURN_TYPES = ('LATENT',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, context, name):
        result = context[name] if name in context else None
        return (result,)


class TyContextMask:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
                "name": ("STRING", {"tooltip": "Name of the item to output."}),
            },
        }
 
    RETURN_TYPES = ('MASK',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, context, name):
        result = context[name] if name in context else None
        return (result,)


class TyContextAudio:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
                "name": ("STRING", {"tooltip": "Name of the item to output."}),
            },
        }
 
    RETURN_TYPES = ('AUDIO',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, context, name):
        result = context[name] if name in context else None
        return (result,)


class TyContextModel:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
                "name": ("STRING", {"tooltip": "Name of the item to output."}),
            },
        }
 
    RETURN_TYPES = ('MODEL',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, context, name):
        result = context[name] if name in context else None
        return (result,)


class TyContextClip:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
                "name": ("STRING", {"tooltip": "Name of the item to output."}),
            },
        }
 
    RETURN_TYPES = ('MODEL',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, context, name):
        result = context[name] if name in context else None
        return (result,)


class TyContextClip:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
                "name": ("STRING", {"tooltip": "Name of the item to output."}),
            },
        }
 
    RETURN_TYPES = ('CLIP',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, context, name):
        result = context[name] if name in context else None
        return (result,)


class TyContextVae:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
                "name": ("STRING", {"tooltip": "Name of the item to output."}),
            },
        }
 
    RETURN_TYPES = ('VAE',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, context, name):
        result = context[name] if name in context else None
        return (result,)


class TyContextConditioning:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
                "name": ("STRING", {"tooltip": "Name of the item to output."}),
            },
        }
 
    RETURN_TYPES = ('CONDITIONING',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, context, name):
        result = context[name] if name in context else None
        return (result,)


class TyContextFormat:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "context": ("*", {"tooltip": "A map {name: value}."}),
            },
        }
 
    RETURN_TYPES = ('STRING',)
    FUNCTION = "execute"
    CATEGORY = "tytest"

    def format(self, result, indent, name, value):
        result.append(f"{indent}{name}  ({type(value).__name__})")
        if type(value) == torch.Tensor:
            result.append(f"[{', '.join([str(a) for a in value.shape])}] {str(value.dtype)} {value.device}")
        else:
            result.append(str(value))
        result.append("")

    def formatDict(self, result, indent, d):
        for k in d.keys():
            self.format(result, indent, k, d[k])

    def execute(self, context):
        result = []
        self.formatDict(result, "", context)
        return ("\n".join(result),)

# sentinel for missing inputs
MISS = object()

class TySwitch:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "index": ("INT", {
                        "default": 0,
                        "min": 0,
                        "max": 15,
                        "step": 1,
                        "tooltip": "The index of the active input (0 ... )."}),
            },
            "optional": {
                "in_0": ("*",{"lazy": True}),
                "in_1": ("*",{"lazy": True}),
                "in_2": ("*",{"lazy": True}),
                "in_3": ("*",{"lazy": True}),
                "in_4": ("*",{"lazy": True}),
                "in_5": ("*",{"lazy": True}),
                "in_6": ("*",{"lazy": True}),
                "in_7": ("*",{"lazy": True}),
                "in_8": ("*",{"lazy": True}),
                "in_9": ("*",{"lazy": True}),
                "in_10": ("*",{"lazy": True}),
                "in_11": ("*",{"lazy": True}),
                "in_12": ("*",{"lazy": True}),
                "in_13": ("*",{"lazy": True}),
                "in_14": ("*",{"lazy": True}),
                "in_15": ("*",{"lazy": True}),
            }
        }
 
    RETURN_TYPES = ('*',)
    RETURN_NAMES = ('active',)
    FUNCTION = "execute"
    CATEGORY = "tytest"
 
    def execute(self, index, in_0 = None, in_1 = None, in_2 = None, in_3 = None, in_4 = None, in_5 = None, in_6 = None, in_7 = None, in_8 = None, in_9 = None, in_10 = None, in_11 = None, in_12 = None, in_13 = None, in_14 = None, in_15 = None):
        result = (in_0, in_1, in_2, in_3, in_4, in_5, in_6, in_7, in_8, in_9, in_10, in_11, in_12, in_13, in_14, in_15)[index]
        return (result,)

    
    def check_lazy_status(self, index, in_0 = MISS, in_1 = MISS, in_2 = MISS, in_3 = MISS, in_4 = MISS, in_5 = MISS, in_6 = MISS, in_7 = MISS, in_8 = MISS, in_9 = MISS, in_10 = MISS, in_11 = MISS, in_12 = MISS, in_13 = MISS, in_14 = MISS, in_15 = MISS):
        connected = (in_0, in_1, in_2, in_3, in_4, in_5, in_6, in_7, in_8, in_9, in_10, in_11, in_12, in_13, in_14, in_15)[index]
        if connected == MISS:
            return []
        result = ("in_0", "in_1", "in_2", "in_3", "in_4", "in_5", "in_6", "in_7", "in_8", "in_9", "in_10", "in_11", "in_12", "in_13", "in_14", "in_15")[index]
        return [result,]
