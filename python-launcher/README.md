# Setting up the environment

```
source activate base
conda create -n python-launcher python=3.10
conda activate python-launcher
pip install -r requirements.txt
```

# Running the code

```
python browser_recorder.py https://www.amazon.com ./logs
```

# Running for webarena

```
python browser_recorder.py http://localhost:7770/ ./logs
```
