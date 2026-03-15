import os
import json
import numpy as np
import av
import torch
from PIL import Image
import node_helpers
import folder_paths
from comfy.cli_args import args
from PIL.PngImagePlugin import PngInfo
import debugpy


class TyNode:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        print ("TyNode INPUT_TYPES called")
        return {
            "required": {
                "text": ("STRING", {"default":"Hey Hey!"}),
                "resize_method": (
                    ["None", "Stretch", "Crop", "Pad"],
                    {"default": "None"},
                ),
            
            },
            "optional": {
                "tt_xx1": ("*",),
                "tt_xx2": ("*",),
                "tt_xx3": ("*",),
                "tt_xx4": ("*",),
                "tt_xx5": ("*",)
            },
        }
 
    RETURN_TYPES = ('STRING',)
    RETURN_NAMES = ('A text',)
 
    FUNCTION = "test"
 
    #OUTPUT_NODE = False
 
    CATEGORY = "tytest"
 
    def test(self, text, resize_method):
        return ("[" + text +"] [" + resize_method + "]",)

class TyDebug:
    def __init__(self):
        pass
    
    @classmethod
    def INPUT_TYPES(s):
        return {
            "optional": {
                "in_test": ("*", {}),
                "in_int": ("INT", {}),
                "in_float": ("FLOAT", {}),
                "in_string": ("STRING", {}),
                "in_boolean": ("BOOLEAN", {}),
                "in_image": ("IMAGE", {}),
                "in_latent": ("LATENT", {}),
                "in_mask": ("MASK", {}),
                "in_audio": ("AUDIO", {}),
            },
        }
 
    RETURN_TYPES = ('STRING',)
    RETURN_NAMES = ('A text',)
 
    FUNCTION = "test"
 
    OUTPUT_NODE = True

    CATEGORY = "tytest"
 
    def test(self, in_test = None, in_int = None, in_float = None, in_string = None, in_boolean = None, in_image = None, in_latent = None, in_mask = None, in_audio = None):
        if not debugpy.is_client_connected():
            print("Debug, waiting for client...")
            debugpy.listen(("localhost", 5678))
            debugpy.wait_for_client()
        print("Debug, connected")
        return ("test",)


def load_and_process_images(image_files, input_dir, count=1, resize_method="None", w=None, h=None):
    """Utility function to load and process a list of images.

    Args:
        image_files: List of image filenames
        input_dir: Base directory containing the images
        resize_method: How to handle images of different sizes ("None", "Stretch", "Crop", "Pad")

    Returns:
        torch.Tensor: Batch of processed images
    """
    if not image_files:
        raise ValueError("No valid images found in input")

    output_images = []

    for file in image_files:
        image_path = os.path.join(input_dir, file)
        img = node_helpers.pillow(Image.open, image_path)

        if img.mode == "I":
            img = img.point(lambda i: i * (1 / 255))
        img = img.convert("RGB")

        if w is None and h is None:
            w, h = img.size[0], img.size[1]

        # Resize image to first image
        if img.size[0] != w or img.size[1] != h:
            if resize_method == "Stretch":
                img = img.resize((w, h), Image.Resampling.LANCZOS)
            elif resize_method == "Crop":
                img = img.crop((0, 0, w, h))
            elif resize_method == "Pad":
                img = img.resize((w, h), Image.Resampling.LANCZOS)
            elif resize_method == "None":
                raise ValueError(
                    "Your input image size does not match the first image in the dataset. Either select a valid resize method or use the same size for all images."
                )

        img_array = np.array(img).astype(np.float32) / 255.0
        img_tensor = torch.from_numpy(img_array)[None,]
        for i in range(0, count):
            output_images.append(img_tensor)

    return torch.cat(output_images, dim=0)


class TyLoadImagesFromOutputFolderNode:

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "folder": ("STRING", {"tooltip": "The folder in the output folder to load images from."})
            },
            "optional": {
                "file": ("STRING", {"tooltip": "A single file to load an image from."}),
                "count": ("INT", {
                        "default": 1,
                        "min": 1,
                        "max": 10000,
                        "step": 1,
                        "tooltip": "Repeat each image.",
                    }),
                "resize_method": (
                    ["None", "Stretch", "Crop", "Pad"],
                    {"default": "None"},
                ),
            },
        }

    RETURN_TYPES = ("IMAGE",)
    FUNCTION = "load_images"
    CATEGORY = "tytest"
    DESCRIPTION = "Loads a batch of images from a directory."

    def load_images(self, folder, file, count, resize_method):
        if folder:
            input_dir = os.path.join(folder_paths.get_output_directory(), folder)
            if file:
                image_files = [file]
            else:
                valid_extensions = [".png", ".jpg", ".jpeg", ".webp"]
                image_files = [
                    f
                    for f in os.listdir(input_dir)
                    if any(f.lower().endswith(ext) for ext in valid_extensions)
                ]
                image_files.sort()
            output_tensor = load_and_process_images(image_files, input_dir, count, resize_method)
        else:
            output_tensor = None
        return (output_tensor,)


class TyLoadImageFromOutputFolderNode:

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "file": ("STRING", {"tooltip": "The file in the output folder."})
            },
            "optional": {
                "count": ("INT", {
                        "default": 1,
                        "min": 1,
                        "max": 10000,
                        "step": 1,
                        "tooltip": "Repeat each image.",
                    }),
                "resize_method": (
                    ["None", "Stretch", "Crop", "Pad"],
                    {"default": "None"},
                ),
            },
        }

    RETURN_TYPES = ("IMAGE",)
    FUNCTION = "load_images"
    CATEGORY = "tytest"
    DESCRIPTION = "Loads a batch of images from a directory."

    def load_images(self, file, count, resize_method):
        if file:
            input_path = os.path.join(folder_paths.get_output_directory(), file)
            input_dir = os.path.dirname(input_path)
            input_file = os.path.basename(input_path)
            image_files = [input_file]
            output_tensor = load_and_process_images(image_files, input_dir, count, resize_method)
        else:
            output_tensor = None
        return (output_tensor,)


class TyLoadImageRangeFromOutputFolderNode:

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "folder": ("STRING", {"tooltip": "The folder in the output folder to load images from."}),
                "first": ("INT", {
                        "default": 0,
                        "min": -1000,
                        "max": 1000,
                        "step": 1,
                        "tooltip": "First Image, negative from end.",
                    }),
                "last": ("INT", {
                        "default": -1,
                        "min": -1000,
                        "max": 1000,
                        "step": 1,
                        "tooltip": "Last Image, negative from end.",
                    }),
                "resize_method": (
                    ["None", "Stretch", "Crop", "Pad"],
                    {"default": "None"},
                ),
            },
        }

    RETURN_TYPES = ("IMAGE",)
    FUNCTION = "load_images"
    CATEGORY = "tytest"
    DESCRIPTION = "Loads a batch of images from a directory."

    def load_images(self, folder, first, last, resize_method):
        if folder:
            input_dir = os.path.join(folder_paths.get_output_directory(), folder)
            valid_extensions = [".png", ".jpg", ".jpeg", ".webp"]
            image_files = [
                f
                for f in os.listdir(input_dir)
                if any(f.lower().endswith(ext) for ext in valid_extensions)
            ]
            image_files.sort()
            if first < 0:
                first = len(image_files) + first
            if first < 0:
                first = 0
            if last < 0:
                last = len(image_files) + last
            last += 1
            if last <= first:
                last = first + 1
            image_files = image_files[first:last]
            output_tensor = load_and_process_images(image_files, input_dir, 1, resize_method)
        else:
            output_tensor = None
        return (output_tensor,)

class TySaveImageShow4:
    def __init__(self):
        self.output_dir = folder_paths.get_output_directory()
        self.type = "output"
        self.prefix_append = ""
        self.compress_level = 4

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "images": ("IMAGE", {"tooltip": "The images to save."}),
                "filename_prefix": ("STRING", {"default": "ComfyUI", "tooltip": "The prefix for the file to save. This may include formatting information such as %date:yyyy-MM-dd% or %Empty Latent Image.width% to include values from nodes."}),
                "rename_folder": ("BOOLEAN", {"default": False, "tooltip": "If exists, rename the old output folder."}),
            },
            "hidden": {
                "prompt": "PROMPT", "extra_pnginfo": "EXTRA_PNGINFO"
            },
        }

    RETURN_TYPES = ()
    FUNCTION = "save_images"

    OUTPUT_NODE = True

    CATEGORY = "tytest"
    DESCRIPTION = "Saves the input images to your ComfyUI output directory."

    def save_images(self, images, filename_prefix, prompt=None, rename_folder=False, extra_pnginfo=None):
        results = list()
        if filename_prefix and images != None:
            filename_prefix += self.prefix_append

            subfolder = os.path.dirname(os.path.normpath(filename_prefix))
            full_folder = os.path.join(self.output_dir, subfolder)
            if rename_folder:
                if os.path.isdir(full_folder):
                    nr = 1
                    while os.path.isdir(f"{full_folder}.{nr}"):
                        nr += 1
                    os.rename(full_folder, f"{full_folder}.{nr}")

            full_output_folder, filename, counter, subfolder, filename_prefix = folder_paths.get_save_image_path(filename_prefix, self.output_dir, images[0].shape[1], images[0].shape[0])
            for (batch_number, image) in enumerate(images):
                i = 255. * image.cpu().numpy()
                img = Image.fromarray(np.clip(i, 0, 255).astype(np.uint8))
                metadata = None
                if not args.disable_metadata:
                    metadata = PngInfo()
                    if prompt is not None:
                        metadata.add_text("prompt", json.dumps(prompt))
                    if extra_pnginfo is not None:
                        for x in extra_pnginfo:
                            metadata.add_text(x, json.dumps(extra_pnginfo[x]))

                filename_with_batch_num = filename.replace("%batch_num%", str(batch_number))
                file = f"{filename_with_batch_num}_{counter:05}_.png"
                img.save(os.path.join(full_output_folder, file), pnginfo=metadata, compress_level=self.compress_level)
                if len(results) < 4:
                    results.append({
                        "filename": file,
                        "subfolder": subfolder,
                        "type": self.type
                    })
                counter += 1

        return { "ui": { "images": results } }

def f32_pcm(wav: torch.Tensor) -> torch.Tensor:
    """Convert audio to float 32 bits PCM format."""
    if wav.dtype.is_floating_point:
        return wav
    elif wav.dtype == torch.int16:
        return wav.float() / (2 ** 15)
    elif wav.dtype == torch.int32:
        return wav.float() / (2 ** 31)
    raise ValueError(f"Unsupported wav dtype: {wav.dtype}")

def load(filepath: str) -> tuple[torch.Tensor, int]:
    with av.open(filepath) as af:
        if not af.streams.audio:
            raise ValueError("No audio stream found in the file.")

        stream = af.streams.audio[0]
        sr = stream.codec_context.sample_rate
        n_channels = stream.channels

        frames = []
        length = 0
        for frame in af.decode(streams=stream.index):
            buf = torch.from_numpy(frame.to_ndarray())
            if buf.shape[0] != n_channels:
                buf = buf.view(-1, n_channels).t()

            frames.append(buf)
            length += buf.shape[1]

        if not frames:
            raise ValueError("No audio frames decoded.")

        wav = torch.cat(frames, dim=1)
        wav = f32_pcm(wav)
        return wav, sr

class TyLoadAudioFromOutputFolderNode:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "file": ("STRING", {"tooltip": "The file in the output folder."}),
            },
        }

    CATEGORY = "tytest"

    RETURN_TYPES = ("AUDIO", )
    FUNCTION = "load"

    def load(self, file):
        audio_path = os.path.join(folder_paths.get_output_directory(), file)
        waveform, sample_rate = load(audio_path)
        audio = {"waveform": waveform.unsqueeze(0), "sample_rate": sample_rate}
        return (audio, )

    #@classmethod
    #def IS_CHANGED(s, audio):
    #    image_path = folder_paths.get_annotated_filepath(audio)
    #    m = hashlib.sha256()
    #    with open(image_path, 'rb') as f:
    #        m.update(f.read())
    #    return m.digest().hex()

    #@classmethod
    #def VALIDATE_INPUTS(s, audio):
    #    if not folder_paths.exists_annotated_filepath(audio):
    #        return "Invalid audio file: {}".format(audio)
    #    return True
