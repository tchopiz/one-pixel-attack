import boa from '@pipcook/boa';
import np from 'py:numpy';
import type { NumpyArray1D, NumpyArray2D, NumpyArray3D } from 'py:numpy';
import tf from 'py:tensorflow';
import type { Model } from 'py:tensorflow';
import { getDefaultImage, getDefaultLabel, getDefaultModel } from './default';
import type { MultipartFile } from '../server';

const {
  keras: {
    layers: { Softmax },
    models: { Sequential, load_model },
    preprocessing: {
      image: { img_to_array, load_img },
    },
  },
} = tf;

class ImageClassifier {
  image: NumpyArray3D;

  label: number;

  model: Model;

  normalized: boolean;

  shape: [number, number];

  constructor(model?: MultipartFile, image?: MultipartFile, label?: number) {
    const key = Math.random();
    if (model === undefined) {
      this.model = getDefaultModel();
      this.normalized = true;
      this.image = getDefaultImage(key);
      this.shape = [this.image.shape[0], this.image.shape[1]];
      this.label = getDefaultLabel(key);
    } else if (image === undefined) {
      this.model = this.#getModel(model);
      this.normalized = model.name === 'normalized.h5';
      this.image = getDefaultImage(key);
      this.shape = [this.image.shape[0], this.image.shape[1]];
      this.label = getDefaultLabel(key);
      this.normalized = true;
    } else if (label === undefined) {
      this.model = this.#getModel(model);
      this.normalized = model.name === 'normalized.h5';
      this.image = this.#getImage(image);
      this.shape = [this.image.shape[0], this.image.shape[1]];
      this.label = np.argmax(this.getPrediction());
    } else {
      this.model = this.#getModel(model);
      this.normalized = model.name === 'normalized.h5';
      this.image = this.#getImage(image);
      this.shape = [this.image.shape[0], this.image.shape[1]];
      this.label = label;
    }
  }

  getPrediction(): NumpyArray1D {
    return this.model.predict<NumpyArray2D>(np.expand_dims(this.image, 0))[0];
  }

  #getImage(image: MultipartFile): NumpyArray3D {
    if (image.name === 'normalized.npy') {
      const array = np.load<NumpyArray3D>(image.path).astype('float64');
      if (this.normalized) return array;
      return np.around(np.multiply(array, 255));
    }
    if (image.name === 'raw.npy') {
      const array = np.load<NumpyArray3D>(image.path).astype('float64');
      if (this.normalized) return np.divide(array, 255);
      return np.load(image.path);
    }
    const array = img_to_array(
      load_img(image.path),
      boa.kwargs({ dtype: 'float64' }),
    );
    if (this.normalized) np.divide(array, 255);
    return array;
  }

  #getModel(model: MultipartFile): Model {
    return new Sequential(
      boa.kwargs({
        layers: [load_model(model.path), new Softmax()],
      }),
    );
  }
}

export default ImageClassifier;
