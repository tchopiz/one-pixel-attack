import np from 'py:numpy';
import AdversarialAttacker from './adversarial-attacker';
import ImageClassifier from './image-classifier';
import Server from './server';
import type { Handler, MultipartFile } from './server';

interface Body {
  image: 'default' | MultipartFile;
  model: 'default' | MultipartFile;
  label: string;
  perturbation: string;
}

const handler: Handler = async (req) => {
  const { getBody, getMethod, getUrl } = req;
  if (getMethod() === 'OPTIONS') return;
  if (getUrl().pathname !== '/') return { code: 404 };
  const body = await getBody<Body>();
  if (!body) return { code: 400 };
  console.info(body);
  const imageClassifier = new ImageClassifier(
    body.model === 'default' ? undefined : body.model,
    body.image === 'default' ? undefined : body.image,
    isNaN(Number(body.label)) ? undefined : Number(body.label),
  );
  const adversarialAttacker = new AdversarialAttacker(imageClassifier);
  return {
    body: {
      image: np.around(np.multiply(imageClassifier.image, 255)).tolist(),
      label: imageClassifier.label,
      perturbation: adversarialAttacker.perturbation,
      prediction: imageClassifier.getPrediction().tolist(),
      shape: imageClassifier.getShape(),
    },
  };
};

const server = new Server(handler);
server.start(3001);
