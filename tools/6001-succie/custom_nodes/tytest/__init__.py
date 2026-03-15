from .tyio import TyNode, TyDebug, TyLoadImagesFromOutputFolderNode, TyLoadImageFromOutputFolderNode, TyLoadImageRangeFromOutputFolderNode, TySaveImageShow4, TyLoadAudioFromOutputFolderNode
from .tycontext import  TyContext,  TyContextInt, TyContextFloat, TyContextString, TyContextBoolean, TyContextAudio, TyContextImage, TyContextMask, TyContextLatent, TyContextVae, TyContextModel, TyContextClip, TyContextConditioning, TyContextFormat, TySwitch

NODE_CLASS_MAPPINGS = {
    "TyNode": TyNode,
    "TyDebug": TyDebug,
    "TyLoadImagesFromOutputFolderNode": TyLoadImagesFromOutputFolderNode,
    "TyLoadImageFromOutputFolderNode": TyLoadImageFromOutputFolderNode,
    "TyLoadImageRangeFromOutputFolderNode": TyLoadImageRangeFromOutputFolderNode,
    "TyLoadAudioFromOutputFolderNode": TyLoadAudioFromOutputFolderNode,
    "TySaveImageShow4": TySaveImageShow4,
    "TyContext": TyContext,
    "TyContextInt": TyContextInt,
    "TyContextFloat": TyContextFloat,
    "TyContextString": TyContextString,
    "TyContextBoolean": TyContextBoolean,
    "TyContextAudio": TyContextAudio,
    "TyContextImage": TyContextImage,
    "TyContextMask": TyContextMask,
    "TyContextLatent": TyContextLatent,
    "TyContextVae": TyContextVae,
    "TyContextModel": TyContextModel,
    "TyContextClip": TyContextClip,
    "TyContextConditioning": TyContextConditioning,
    "TyContextFormat": TyContextFormat,
    "TySwitch": TySwitch,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "TyNode": "My First Node",
    "TyDebug": "Ty Connect to Debugger",
    "TyLoadImagesFromOutputFolderNode":  "Ty Load Images From Output Folder (sorted)",
    "TyLoadImageFromOutputFolderNode": "Ty Load Image From Output Folder",
    "TyLoadImageRangeFromOutputFolderNode": "Ty Load Image Range From Output Folder (sorted)",
    "TyLoadAudioFromOutputFolderNode":  "Ty Load Audio From Output Folder",
    "TySaveImageShow4": "Ty Save Image (show only 4 images)",
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS'] 