import os
import bpy
from bpy.app.handlers import persistent

bl_info = {
    "name": "OBJ Export on Save",
    "blender": (2, 81, 0),
    "category": "Process",
}

targetDir = '/path/to/p5live/models/'


@persistent
def export_as_obj(dummy):
    filename = os.path.splitext(os.path.basename(bpy.data.filepath))
    targetFilePath = targetDir + filename[0] + '.obj'
    print('exporting obj to:', targetFilePath)

    bpy.ops.export_scene.obj(
        filepath=targetFilePath,
        check_existing=False,
        # axis_forward='-Z',
        # axis_up='Y',
        # use_selection=True,
        # use_animation=False,
        # use_mesh_modifiers=True,
        # use_edges=True,
        # use_smooth_groups=False,
        # use_smooth_groups_bitflags=False,
        # use_normals=True,
        # use_uvs=True,
        # use_materials=True,
        # use_triangles=False,
        # use_nurbs=False,
        # use_vertex_groups=False,
        # use_blen_objects=True,
        # group_by_object=False,
        # group_by_material=False,
        # keep_vertex_order=False,
        # global_scale=1,
        # path_mode='AUTO'
    )


def register():
    print("Hello World")
    if not export_as_obj in bpy.app.handlers.save_post:
        bpy.app.handlers.save_post.append(export_as_obj)


def unregister():
    print("Goodbye World")
    if export_as_obj in bpy.app.handlers.save_post:
        bpy.app.handlers.save_post.remove(export_as_obj)


# This allows you to run the script directly from Blender's Text editor
# to test the add-on without having to install it.
if __name__ == "__main__":
    register()
