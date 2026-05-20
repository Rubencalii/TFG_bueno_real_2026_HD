<?php

namespace App\Form;

use App\Entity\Mesa;
use App\Entity\Reserva;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TelType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TimeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class ReservaType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('nombreCliente', TextType::class, [
                'label' => 'Nombre del cliente',
                'attr' => [
                    'placeholder' => 'Nombre completo',
                    'class' => 'form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-11 px-4 text-sm',
                ],
                'constraints' => [
                    new Assert\NotBlank(message: 'El nombre no puede estar vacío'),
                    new Assert\Length(min: 2, max: 100),
                ],
            ])
            ->add('telefono', TelType::class, [
                'label' => 'Teléfono',
                'attr' => [
                    'placeholder' => '+34 600 000 000',
                    'class' => 'form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-11 px-4 text-sm',
                ],
                'constraints' => [
                    new Assert\NotBlank(message: 'El teléfono no puede estar vacío'),
                    new Assert\Regex(
                        pattern: '/^\+?[\d\s\-]{7,20}$/',
                        message: 'El formato del teléfono no es válido'
                    ),
                ],
            ])
            ->add('email', EmailType::class, [
                'label' => 'Email (opcional)',
                'required' => false,
                'attr' => [
                    'placeholder' => 'cliente@ejemplo.com',
                    'class' => 'form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-11 px-4 text-sm',
                ],
                'constraints' => [
                    new Assert\Email(message: 'El email no tiene un formato válido'),
                ],
            ])
            ->add('fecha', DateType::class, [
                'label' => 'Fecha de la reserva',
                'widget' => 'single_text',
                'attr' => [
                    'class' => 'form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-11 px-4 text-sm',
                    'min' => (new \DateTime())->format('Y-m-d'),
                ],
                'constraints' => [
                    new Assert\NotBlank(message: 'La fecha no puede estar vacía'),
                    new Assert\GreaterThanOrEqual(
                        value: 'today',
                        message: 'La fecha no puede ser anterior a hoy'
                    ),
                ],
            ])
            ->add('hora', TimeType::class, [
                'label' => 'Hora',
                'widget' => 'single_text',
                'attr' => [
                    'class' => 'form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-11 px-4 text-sm',
                ],
                'constraints' => [
                    new Assert\NotBlank(message: 'La hora no puede estar vacía'),
                ],
            ])
            ->add('numPersonas', IntegerType::class, [
                'label' => 'Número de personas',
                'attr' => [
                    'min' => 1,
                    'max' => 50,
                    'class' => 'form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-11 px-4 text-sm',
                ],
                'constraints' => [
                    new Assert\NotBlank(message: 'El número de personas es obligatorio'),
                    new Assert\Positive(message: 'Debe haber al menos 1 persona'),
                    new Assert\LessThanOrEqual(value: 50, message: 'Máximo 50 personas por reserva'),
                ],
            ])
            ->add('notas', TextareaType::class, [
                'label' => 'Notas o peticiones especiales',
                'required' => false,
                'attr' => [
                    'rows' => 3,
                    'placeholder' => 'Alergias, cumpleaños, silla para bebé...',
                    'class' => 'form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm',
                ],
                'constraints' => [
                    new Assert\Length(max: 500, maxMessage: 'Las notas no pueden superar 500 caracteres'),
                ],
            ])
            ->add('estado', ChoiceType::class, [
                'label' => 'Estado',
                'choices' => [
                    'Pendiente'   => Reserva::ESTADO_PENDIENTE,
                    'Confirmada'  => Reserva::ESTADO_CONFIRMADA,
                    'Cancelada'   => Reserva::ESTADO_CANCELADA,
                    'Completada'  => Reserva::ESTADO_COMPLETADA,
                    'No presentado' => Reserva::ESTADO_NO_SHOW,
                ],
                'attr' => [
                    'class' => 'form-select w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-11 px-4 text-sm',
                ],
                'constraints' => [
                    new Assert\NotBlank(message: 'El estado no puede estar vacío'),
                    new Assert\Choice(
                        choices: ['pendiente', 'confirmada', 'cancelada', 'completada', 'no_show'],
                        message: 'Estado no válido'
                    ),
                ],
            ])
            ->add('mesa', EntityType::class, [
                'class' => Mesa::class,
                'label' => 'Mesa asignada (opcional)',
                'required' => false,
                'choice_label' => fn(Mesa $mesa) => 'Mesa ' . $mesa->getNumero(),
                'placeholder' => '— Sin asignar —',
                'attr' => [
                    'class' => 'form-select w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-11 px-4 text-sm',
                ],
            ])
            ->add('guardar', SubmitType::class, [
                'label' => 'Guardar Reserva',
                'attr' => [
                    'class' => 'w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all',
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Reserva::class,
        ]);
    }
}
