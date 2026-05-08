

import tensorflow as tf
import numpy as np
import time
import json
import os

# ========== CONFIGURATION ==========
CONFIG = {
    "epochs": 5,
    "batch_size": 32,
    "model_name": "mnist_cnn"
}

# ========== DATA PREPARATION ==========
def load_and_prepare_data():
    """Load and preprocess MNIST dataset"""
    print("Loading MNIST dataset...")
    (x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()
    
    # Normalize and reshape
    x_train = x_train.reshape(-1, 28, 28, 1).astype('float32') / 255.0
    x_test = x_test.reshape(-1, 28, 28, 1).astype('float32') / 255.0
    
    print(f"Training samples: {len(x_train)}")
    print(f"Test samples: {len(x_test)}")
    return (x_train, y_train), (x_test, y_test)

# ========== MODEL ARCHITECTURE ==========
def create_cnn_model():
    """Create a simple CNN model for MNIST"""
    model = tf.keras.Sequential([
        tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(10, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.summary()
    return model


def train_model():
    """Main training function"""
    print("=" * 50)
    print("STARTING TRAINING")
    print(f"Epochs: {CONFIG['epochs']}, Batch size: {CONFIG['batch_size']}")
    print("=" * 50)
    
    # Load data
    (x_train, y_train), (x_test, y_test) = load_and_prepare_data()
    
    # Create model
    model = create_cnn_model()
    
    # Start timer
    start_time = time.time()
    
    # Train
    history = model.fit(
        x_train, y_train,
        epochs=CONFIG['epochs'],
        batch_size=CONFIG['batch_size'],
        validation_data=(x_test, y_test),
        verbose=1
    )
    
    # End timer
    end_time = time.time()
    training_time = end_time - start_time
    
    # Evaluate
    test_loss, test_accuracy = model.evaluate(x_test, y_test, verbose=0)
    
    # Save model
    model.save(f"models/{CONFIG['model_name']}.h5")
    
    # Collect results
    results = {
        "test_accuracy": float(test_accuracy),
        "test_loss": float(test_loss),
        "training_time_seconds": float(training_time),
        "final_epoch_accuracy": float(history.history['accuracy'][-1]),
        "final_epoch_val_accuracy": float(history.history['val_accuracy'][-1]),
        "system_info": {
            "gpu_available": len(tf.config.list_physical_devices('GPU')) > 0,
            "gpu_count": len(tf.config.list_physical_devices('GPU')),
            "tensorflow_version": tf.__version__
        }
    }
    
    # Print summary
    print("\n" + "=" * 50)
    print("TRAINING COMPLETE")
    print(f"Test Accuracy: {test_accuracy:.4f}")
    print(f"Training Time: {training_time:.2f} seconds")
    print(f"GPU Available: {results['system_info']['gpu_available']}")
    print("=" * 50)
    
    # Save results to JSON
    with open(f"results_{CONFIG['model_name']}.json", 'w') as f:
        json.dump(results, f, indent=4)
    
    print(f"Results saved to results_{CONFIG['model_name']}.json")
    print(f"Model saved to models/{CONFIG['model_name']}.h5")
    
    return results

# ========== MAIN EXECUTION ==========
if __name__ == "__main__":
    # Check GPU availability
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print(f"GPUs detected: {len(gpus)}")
        for gpu in gpus:
            print(f"  - {gpu.name}")
    else:
        print("No GPU detected, running on CPU")
    
    # Run training
    results = train_model()



























    
