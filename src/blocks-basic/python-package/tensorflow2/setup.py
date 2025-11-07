import setuptools

long_description = """nothing"""

setuptools.setup(
    name="browser_tensorflow",
    version="0.0.1",
    author="ChrisJaunes",
    author_email="chrisjaunes@gmail.com",
    description=long_description,
    long_description=long_description,
    packages=setuptools.find_packages(),
    classifiers=[
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Interpreters",
        "Operating System :: OS Independent",
        "License :: OSI Approved :: GNU General Public License v3 (GPLv3)",
        "Programming Language :: Python :: 3",
    ],
    python_requires='>=3.4',
)
