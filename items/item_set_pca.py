from sklearn.decomposition import PCA
import numpy as np

pca = PCA(n_components=2)

reduction = pca.fit_transform(x)

print(pca.explained_variance_ratio_)


